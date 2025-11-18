'use client'

import { ReactNode, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isInitializing } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isInitializing) return

    if (!isAuthenticated && pathname !== "/sign-in") {
      router.replace("/sign-in")
    }

    if (isAuthenticated && pathname === "/sign-in") {
      router.replace("/dashboard")
    }
  }, [isAuthenticated, isInitializing, pathname, router])

  if (isInitializing) {
    return null
  }

  if (!isAuthenticated && pathname !== "/sign-in") {
    return null
  }

  if (pathname === "/sign-in") {
    return <>{children}</>
  }

  return <>{children}</>
}
