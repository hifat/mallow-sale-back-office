import { SignInInput, SignInResponse, RefreshTokenInput, RefreshTokenResponse, signInSchema, refreshTokenSchema, AuthErrorCode } from "@/types/sign-in"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"

interface ApiErrorBody {
  code?: AuthErrorCode
  message?: string
}

async function handleAuthError(response: Response): Promise<never> {
  let errorMessage = "Authentication error"
  try {
    const data: ApiErrorBody = await response.json()
    if (data && data.message) {
      errorMessage = data.message
    }
  } catch (_) {
  }
  throw new Error(errorMessage)
}

export async function signIn(payload: SignInInput): Promise<SignInResponse> {
  const parsed = signInSchema.safeParse(payload)
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message || "Invalid form")
  }

  const res = await fetch(`${API_BASE}/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    await handleAuthError(res)
  }

  return res.json()
}

export async function refreshToken(payload: RefreshTokenInput): Promise<RefreshTokenResponse> {
  const parsed = refreshTokenSchema.safeParse(payload)
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message || "Invalid form")
  }

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    await handleAuthError(res)
  }

  return res.json()
}
