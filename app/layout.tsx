import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { I18nProvider } from "@/contexts/i18n-context"
import { AppRoot } from "@/components/app-root"

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
          <AppRoot>{children}</AppRoot>
        </I18nProvider>
      </body>
    </html>
  )
}
