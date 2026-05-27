"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/hooks/use-translation"
import { PurchaseForm } from "@/components/purchase-form"
import { fetchPurchaseById, updatePurchase } from "@/lib/purchase-api"
import type { Purchase, PurchasePayload } from "@/types/purchase"

export default function EditPurchasePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()
  const [purchase, setPurchase] = useState<Purchase | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!params?.id) return
      try {
        const data = await fetchPurchaseById(params.id)
        setPurchase(data)
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : t("purchase.toast.fetchDetailError")
        toast({
          variant: "destructive",
          title: t("common.error"),
          description: message,
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id, toast, t])

  const handleSave = async (payload: PurchasePayload) => {
    if (!purchase) return
    setSubmitting(true)
    try {
      await updatePurchase(purchase.id, payload)
      toast({
        title: t("common.success"),
        description: t("purchase.toast.updateSuccess"),
      })
      router.push(`/purchases/${purchase.id}`)
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : t("purchase.toast.updateError")
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: message,
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (!purchase) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-xl font-semibold mb-4">{t("purchase.notFound")}</h2>
        <Button onClick={() => router.push("/purchases")}>
          {t("purchase.backToList")}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push(`/purchases/${purchase.id}`)}
          className="hover:bg-gray-100"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          {t("common.back")}
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">{t("purchase.editTitle")}</h1>
      </div>

      <PurchaseForm
        purchase={purchase}
        onSave={handleSave}
        onCancel={() => router.push(`/purchases/${purchase.id}`)}
        submitting={submitting}
      />
    </div>
  )
}
