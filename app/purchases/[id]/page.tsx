"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/hooks/use-translation"
import { fetchPurchaseById, updatePurchase } from "@/lib/purchase-api"
import type { PaymentTypeCode, Purchase, PurchasePayload, PurchaseStatusCode } from "@/types/purchase"
import { USAGE_UNITS } from "@/types/usage-unit"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type UIStatusCode = "PENDING" | "IN_PROGRESS" | "COMPLETE" | "CANCEL"

const UI_STATUS_OPTIONS: { code: UIStatusCode; name: string }[] = [
  { code: "PENDING", name: "Pending" },
  { code: "IN_PROGRESS", name: "In Progress" },
  { code: "COMPLETE", name: "Complete" },
  { code: "CANCEL", name: "Cancel" },
]

const PAYMENT_OPTIONS: { code: PaymentTypeCode; name: string }[] = [
  { code: "CASH", name: "เงินสด" },
  { code: "E_PAYMENT", name: "e-payment" },
  { code: "CREDIT_CARD", name: "บัตรเครดิต" },
]

const toUIStatus = (status: PurchaseStatusCode): UIStatusCode =>
  status === "SUCCESS" ? "COMPLETE" : status

const toApiStatus = (status: UIStatusCode): PurchaseStatusCode =>
  status === "COMPLETE" ? "SUCCESS" : status

function unitDisplayName(code: string) {
  if (!code) return "-"
  const unit = USAGE_UNITS.find((u) => u.code.toUpperCase() === code.toUpperCase())
  return unit?.name || code
}

export default function PurchaseDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()
  const [purchase, setPurchase] = useState<Purchase | null>(null)
  const [draft, setDraft] = useState<Purchase | null>(null)
  const [status1, setStatus1] = useState<UIStatusCode>("PENDING")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!params?.id) return
      try {
        const data = await fetchPurchaseById(params.id)
        setPurchase(data)
        setDraft(data)
        setStatus1(toUIStatus(data.purchaseStatusCode))
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

  const handleStatus1Change = (nextStatus: UIStatusCode) => {
    if (!draft) return
    setStatus1(nextStatus)
    setDraft({
      ...draft,
      suppliers: draft.suppliers.map((supplier) => ({
        ...supplier,
        statusCode: toApiStatus(nextStatus),
        orders: supplier.orders.map((order) => ({
          ...order,
          statusCode: toApiStatus(nextStatus),
        })),
      })),
    })
  }

  const handleStatus2Change = (supplierIndex: number, nextStatus: UIStatusCode) => {
    if (!draft) return
    setDraft({
      ...draft,
      suppliers: draft.suppliers.map((supplier, idx) =>
        idx === supplierIndex
          ? {
              ...supplier,
              statusCode: toApiStatus(nextStatus),
              orders: supplier.orders.map((order) => ({
                ...order,
                statusCode: toApiStatus(nextStatus),
              })),
            }
          : supplier
      ),
    })
  }

  const handleStatus3Change = (
    supplierIndex: number,
    orderIndex: number,
    nextStatus: UIStatusCode
  ) => {
    if (!draft) return
    setDraft({
      ...draft,
      suppliers: draft.suppliers.map((supplier, sIdx) =>
        sIdx === supplierIndex
          ? {
              ...supplier,
              orders: supplier.orders.map((order, oIdx) =>
                oIdx === orderIndex
                  ? { ...order, statusCode: toApiStatus(nextStatus) }
                  : order
              ),
            }
          : supplier
      ),
    })
  }

  const handlePaymentTypeChange = (supplierIndex: number, paymentType: PaymentTypeCode) => {
    if (!draft) return
    setDraft({
      ...draft,
      suppliers: draft.suppliers.map((supplier, idx) =>
        idx === supplierIndex ? { ...supplier, paymentType } : supplier
      ),
    })
  }

  const handleSave = async () => {
    if (!purchase || !draft) return
    setSubmitting(true)
    try {
      const payload: PurchasePayload = {
        purchaseStatusCode: toApiStatus(status1),
        suppliers: draft.suppliers,
      }
      const updated = await updatePurchase(purchase.id, payload)
      setPurchase(updated)
      setDraft(updated)
      setStatus1(toUIStatus(updated.purchaseStatusCode))
      toast({
        title: t("common.success"),
        description: t("purchase.toast.updateSuccess"),
      })
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

  const handleCancel = () => {
    if (purchase) {
      setDraft(purchase)
      setStatus1(toUIStatus(purchase.purchaseStatusCode))
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
    <div className="space-y-4 max-w-6xl mx-auto">
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push("/purchases")}
          className="hover:bg-gray-100"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          {t("common.back")}
        </Button>
      </div>

      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
            <span className="font-mono text-sm font-semibold text-gray-900">
              {purchase.id.slice(-8)}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(purchase.createdAt).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={status1}
              onValueChange={(v) => handleStatus1Change(v as UIStatusCode)}
            >
              <SelectTrigger className="h-9 w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UI_STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status.code} value={status.code}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              className="h-9"
              onClick={() => router.push(`/purchases/${purchase.id}/edit`)}
            >
              {t("common.edit")}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {(draft?.suppliers || []).map((supplier, supplierIndex) => (
            <div
              key={`${supplier.supplierId}-${supplierIndex}`}
              className="rounded-lg border border-gray-100 overflow-hidden"
            >
              <div className="flex flex-col gap-2 bg-gray-50/80 px-3 py-2.5 md:flex-row md:items-center md:justify-between">
                <p className="text-sm font-semibold text-gray-900">
                  {supplier.supplierName || "-"}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={toUIStatus(supplier.statusCode)}
                    onValueChange={(v) =>
                      handleStatus2Change(supplierIndex, v as UIStatusCode)
                    }
                  >
                    <SelectTrigger className="h-8 w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UI_STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status.code} value={status.code}>
                          {status.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={supplier.paymentType}
                    onValueChange={(v) =>
                      handlePaymentTypeChange(supplierIndex, v as PaymentTypeCode)
                    }
                  >
                    <SelectTrigger className="h-8 w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_OPTIONS.map((option) => (
                        <SelectItem key={option.code} value={option.code}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {supplier.orders.map((order, orderIndex) => (
                  <div
                    key={`${order.inventoryID}-${orderIndex}`}
                    className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {order.inventoryName || "-"}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-md bg-white border border-gray-200 px-2 py-0.5 text-sm tabular-nums text-gray-800">
                          {order.quantity}
                        </span>
                        <Badge
                          variant="secondary"
                          className="bg-yellow-50 text-yellow-800 border-yellow-100 font-normal"
                        >
                          {unitDisplayName(order.usageUnitCode)}
                        </Badge>
                      </div>
                    </div>
                    <Select
                      value={toUIStatus(order.statusCode)}
                      onValueChange={(v) =>
                        handleStatus3Change(
                          supplierIndex,
                          orderIndex,
                          v as UIStatusCode
                        )
                      }
                    >
                      <SelectTrigger className="h-8 w-full sm:w-[150px] shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {UI_STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status.code} value={status.code}>
                            {status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button
            type="button"
            onClick={handleSave}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
            disabled={submitting}
          >
            {submitting ? t("common.loading") : "Submit"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={submitting}
          >
            {t("common.cancel")}
          </Button>
        </div>
      </div>
    </div>
  )
}
