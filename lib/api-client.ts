import { AuthErrorCode } from "@/types/sign-in"
import { refreshToken as apiRefreshToken } from "@/lib/sign-in-api"
import { getStoredAuth, setStoredAuth, clearStoredAuth, type StoredAuth } from "@/lib/auth-storage"

interface ApiErrorBody {
  code?: AuthErrorCode | string
  message?: string
}

function forceSignOut(message?: string): never {
  clearStoredAuth()
  if (typeof window !== "undefined") {
    window.location.href = "/sign-in"
  }
  throw new Error(message || "Session expired")
}

export async function authorizedFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const storedAuth = getStoredAuth()

  const headers = new Headers(init.headers || {})
  if (storedAuth?.accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${storedAuth.accessToken}`)
  }

  let response = await fetch(input, { ...init, headers })

  if (response.ok) {
    return response
  }

  let errorBody: ApiErrorBody | null = null
  try {
    const cloned = response.clone()
    errorBody = (await cloned.json()) as ApiErrorBody
  } catch {
    return response
  }

  if (errorBody?.code !== "TOKEN_EXPIRED") {
    return response
  }

  const current = getStoredAuth()
  if (!current?.refreshToken) {
    forceSignOut(errorBody?.message)
  }

  let tokens
  try {
    tokens = await apiRefreshToken({ refreshToken: current!.refreshToken! })
  } catch {
    forceSignOut(errorBody?.message)
  }

  const updatedAuth: StoredAuth = {
    user: current!.user,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  }
  setStoredAuth(updatedAuth)

  const retryHeaders = new Headers(init.headers || {})
  retryHeaders.set("Authorization", `Bearer ${tokens.accessToken}`)

  const retryResponse = await fetch(input, { ...init, headers: retryHeaders })
  if (!retryResponse.ok) {
    let retryBody: ApiErrorBody | null = null
    try {
      const clonedRetry = retryResponse.clone()
      retryBody = (await clonedRetry.json()) as ApiErrorBody
    } catch {
    }
    if (retryBody?.code === "TOKEN_EXPIRED") {
      forceSignOut(retryBody.message)
    }
  }

  return retryResponse
}
