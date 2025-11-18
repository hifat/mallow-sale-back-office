"use client"

import { SignInForm } from "@/components/sign-in-form"
import { useTranslation } from "@/hooks/use-translation"

export default function SignInPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-full flex items-center justify-center">
      <div className="w-full max-w-md bg-white border border-yellow-200 rounded-lg shadow-sm p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">{t("auth.signInTitle")}</h1>
          <p className="mt-2 text-sm text-gray-600">{t("auth.signInSubtitle")}</p>
        </div>
        <SignInForm />
      </div>
    </div>
  )
}
