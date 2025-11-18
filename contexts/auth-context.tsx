'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { AuthUser, SignInInput, RefreshTokenResponse } from "@/types/sign-in"
import { signIn as apiSignIn, refreshToken as apiRefreshToken } from "@/lib/sign-in-api"

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isInitializing: boolean
  signIn: (data: SignInInput) => Promise<void>
  signOut: () => void
  updateTokens: (tokens: RefreshTokenResponse) => void
}

const STORAGE_KEY = "mallow-sale-auth"

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
  })
  const [isInitializing, setIsInitializing] = useState(true)
  const [lastActivityAt, setLastActivityAt] = useState<number | null>(null)

  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null
      if (stored) {
        const parsed = JSON.parse(stored) as AuthState
        if (parsed && parsed.accessToken && parsed.refreshToken) {
          setState(parsed)
          setLastActivityAt(Date.now())
        }
      }
    } catch (_) {
    } finally {
      setIsInitializing(false)
    }
  }, [])

  useEffect(() => {
    const handleActivity = () => {
      setLastActivityAt(Date.now())
    }

    if (typeof window !== "undefined") {
      window.addEventListener("click", handleActivity)
      window.addEventListener("keydown", handleActivity)
      window.addEventListener("mousemove", handleActivity)
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("click", handleActivity)
        window.removeEventListener("keydown", handleActivity)
        window.removeEventListener("mousemove", handleActivity)
      }
    }
  }, [])

  useEffect(() => {
    if (isInitializing) return

    const isAuth = Boolean(state.accessToken && state.refreshToken)

    if (!isAuth && pathname !== "/sign-in") {
      router.replace("/sign-in")
    }
    if (isAuth && pathname === "/sign-in") {
      router.replace("/dashboard")
    }
  }, [isInitializing, state.accessToken, state.refreshToken, pathname, router])

  useEffect(() => {
    if (!state.refreshToken) return

    const interval = setInterval(async () => {
      if (!state.refreshToken) return
      if (!lastActivityAt) return
      const now = Date.now()
      const FIVE_MINUTES = 5 * 60 * 1000
      if (now - lastActivityAt > FIVE_MINUTES) {
        return
      }

      try {
        const tokens = await apiRefreshToken({ refreshToken: state.refreshToken })
        setState((prev) => ({
          ...prev,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        }))
        if (typeof window !== "undefined") {
          const payload: AuthState = {
            user: state.user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          }
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
        }
      } catch (_) {
        handleSignOut()
      }
    }, 4 * 60 * 1000)

    return () => clearInterval(interval)
  }, [state.refreshToken, state.user, lastActivityAt])

  const persistState = useCallback((next: AuthState) => {
    setState(next)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    }
  }, [])

  const handleSignOut = useCallback(() => {
    const next: AuthState = {
      user: null,
      accessToken: null,
      refreshToken: null,
    }
    setState(next)
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY)
    }
    router.replace("/sign-in")
  }, [router])

  const handleSignIn = useCallback(
    async (credentials: SignInInput) => {
      const response = await apiSignIn(credentials)
      const { user } = response
      const next: AuthState = {
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
        },
        accessToken: user.accessToken,
        refreshToken: user.refreshToken,
      }
      persistState(next)
      setLastActivityAt(Date.now())
      router.replace("/dashboard")
    },
    [persistState, router]
  )

  const updateTokens = useCallback(
    (tokens: RefreshTokenResponse) => {
      if (!state.user) return
      const next: AuthState = {
        user: state.user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      }
      persistState(next)
    },
    [persistState, state.user]
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      isAuthenticated: Boolean(state.accessToken && state.refreshToken),
      isInitializing,
      signIn: handleSignIn,
      signOut: handleSignOut,
      updateTokens,
    }),
    [state.user, state.accessToken, state.refreshToken, isInitializing, handleSignIn, handleSignOut, updateTokens]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
