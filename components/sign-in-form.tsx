'use client'

import { useState, FormEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/hooks/use-translation"
import { useAuth } from "@/contexts/auth-context"
import { signInSchema, type SignInInput } from "@/types/sign-in"

export function SignInForm() {
  const { t } = useTranslation()
  const { signIn } = useAuth()
  const { toast } = useToast()

  const [form, setForm] = useState<SignInInput>({ username: "", password: "" })
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field: keyof SignInInput) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)

    const parsed = signInSchema.safeParse(form)
    if (!parsed.success) {
      const fieldErrors: { username?: string; password?: string } = {}
      parsed.error.errors.forEach((error) => {
        if (error.path[0] === "username") {
          fieldErrors.username = t("validation.required")
        }
        if (error.path[0] === "password") {
          fieldErrors.password = t("validation.required")
        }
      })
      setErrors(fieldErrors)
      setIsSubmitting(false)
      return
    }

    try {
      await signIn(form)
      toast({
        title: t("common.success"),
        description: t("auth.signInSuccess"),
      })
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error?.message || t("auth.signInFailed"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          {t("auth.username")}
        </label>
        <Input
          id="username"
          type="text"
          autoComplete="username"
          value={form.username}
          onChange={handleChange("username")}
          className={`border-yellow-200 focus:border-yellow-500 ${errors.username ? "border-red-500" : ""}`}
        />
        {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          {t("auth.password")}
        </label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange("password")}
          className={`border-yellow-200 focus:border-yellow-500 ${errors.password ? "border-red-500" : ""}`}
        />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? t("auth.signingIn") : t("auth.signInButton")}
        </Button>
      </div>
    </form>
  )
}
