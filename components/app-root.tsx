'use client'

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"

interface AppRootProps {
  children: ReactNode
}

export function AppRoot({ children }: AppRootProps) {
  const pathname = usePathname()
  const isSignInPage = pathname === "/sign-in"

  return (
    <AuthProvider>
      {isSignInPage ? (
        <>
          <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
            {children}
          </div>
          <Toaster />
        </>
      ) : (
        <>
          <SidebarProvider defaultOpen={true}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-1 flex-col min-w-0 transition-all duration-300">
                <Header />
                <main className="flex-1 p-6 bg-gray-50 overflow-auto">{children}</main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </>
      )}
    </AuthProvider>
  )
}
