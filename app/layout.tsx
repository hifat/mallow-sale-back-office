import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Header } from "@/components/header"
import { Toaster } from "@/components/ui/toaster"
import { I18nProvider } from "@/contexts/i18n-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mallow Sale - Back Office",
  description: "Professional back office management system for Mallow Sale",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <I18nProvider>
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
        </I18nProvider>
      </body>
    </html>
  )
}
