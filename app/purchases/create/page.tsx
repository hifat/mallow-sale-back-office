"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/hooks/use-translation"
import { PurchaseForm } from "@/components/purchase-form"
import { createPurchase } from "@/lib/purchase-api"
import type { PurchasePayload } from "@/types/purchase"

export default function CreatePurchasePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()
  const [submitting, setSubmitting] = useState(false)

  const handleSave = async (payload: PurchasePayload) => {
    setSubmitting(true)
    try {
      const created = await createPurchase(payload)
      toast({
        title: t("common.success"),
        description: t("purchase.toast.createSuccess"),
      })
      router.push(`/purchases/${created.id}`)
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : t("purchase.toast.createError")
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: message,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push("/purchases")}
          className="hover:bg-gray-100"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          {t("common.back")}
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {t("purchase.createTitle")}
        </h1>
        <p className="text-gray-600 mt-1">{t("purchase.createSubtitle")}</p>
      </div>

      <PurchaseForm
        onSave={handleSave}
        onCancel={() => router.push("/purchases")}
        submitting={submitting}
      />
    </div>
  )
}
