import type { AuthUser } from "@/types/sign-in"

export const AUTH_STORAGE_KEY = "mallow-sale-auth"

export interface StoredAuth {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
}

export function getStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredAuth>
    if (!parsed || typeof parsed !== "object") return null

    return {
      user: (parsed.user as AuthUser) ?? null,
      accessToken: (parsed.accessToken as string) ?? null,
      refreshToken: (parsed.refreshToken as string) ?? null,
    }
  } catch {
    return null
  }
}

export function setStoredAuth(auth: StoredAuth): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
  } catch {
  }
}

export function clearStoredAuth(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch {
  }
}
