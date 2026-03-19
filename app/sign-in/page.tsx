"use client"

import { SignInForm } from "@/components/sign-in-form"
import { useTranslation } from "@/hooks/use-translation"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { LanguageToggle } from "@/components/language-toggle"

export default function SignInPage() {
  const { t } = useTranslation()
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      <div className="min-h-full w-full flex items-center justify-center">
        <div className="w-full max-w-sm bg-white border border-yellow-200 rounded-lg shadow-sm p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900">{t("auth.signInTitle")}</h1>
            <p className="mt-2 text-sm text-gray-600">{t("auth.signInSubtitle")}</p>
          </div>
          <SignInForm />
        </div>
      </div>
    </GoogleOAuthProvider>
  )
}
