"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Trash2, ShoppingBag } from "lucide-react"
import { ListCardTable } from "@/components/list-card-table"
import { CenteredEmptyState } from "@/components/ui/CenteredEmptyState"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/hooks/use-translation"
import type { PurchaseListItem, PurchaseStatusCode } from "@/types/purchase"
import { fetchPurchases, deletePurchase } from "@/lib/purchase-api"

function getStatusBadgeClass(statusCode: PurchaseStatusCode) {
  switch (statusCode) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800"
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-800"
    case "SUCCESS":
      return "bg-green-100 text-green-800"
    case "CANCEL":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

function statusLabelKey(status: PurchaseStatusCode) {
  return status === "IN_PROGRESS" ? "inProgress" : status.toLowerCase()
}

export default function PurchasesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()
  const [items, setItems] = useState<PurchaseListItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [deletingItem, setDeletingItem] = useState<PurchaseListItem | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  })

  const loadPurchases = async () => {
    setLoading(true)
    try {
      const response = await fetchPurchases({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        sort: "createdAt",
        order: "desc",
      })
      setItems(response.items)
      setPagination((prev) => ({
        ...prev,
        total: response.meta?.total ?? response.items.length,
      }))
    } catch {
      toast({
        title: t("common.error"),
        description: t("purchase.toast.fetchError"),
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPurchases()
  }, [pagination.page, pagination.limit, searchTerm])

  useEffect(() => {
    if (searchTerm) {
      setPagination((prev) => ({ ...prev, page: 1 }))
    }
  }, [searchTerm])

  const handleDelete = async (item: PurchaseListItem) => {
    setLoading(true)
    try {
      await deletePurchase(item.id)
      setItems((prev) => prev.filter((i) => i.id !== item.id))
      setPagination((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }))
      toast({
        title: t("common.success"),
        description: t("purchase.toast.deleted"),
      })
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : t("purchase.toast.deleteError")
      toast({ variant: "destructive", title: t("common.error"), description: message })
      throw e
    } finally {
      setDeletingItem(null)
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("purchase.management")}
            </h1>
            <p className="text-gray-600 mt-2">{t("purchase.subtitle")}</p>
          </div>
          <Button
            onClick={() => router.push("/purchases/create")}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("purchase.addPurchase")}
          </Button>
        </div>

        <ListCardTable
          title={
            <div className="flex items-center">
              <span>{t("purchase.listTitle")}</span>
              <span className="ml-2 text-sm text-gray-500">
                ({pagination.total} {t("common.list")})
              </span>
            </div>
          }
          search={
            <div className="relative flex-1 max-w-sm pt-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t("common.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-yellow-200 focus:border-yellow-500"
              />
            </div>
          }
          table={
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      {t("purchase.purchaseId")}
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      {t("common.status")}
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      {t("common.createdAt")}
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      {t("common.updatedAt")}
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      {t("common.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array(5)
                      .fill(0)
                      .map((_, index) => (
                        <tr key={`skeleton-${index}`} className="border-b border-gray-100">
                          <td className="py-3 px-4">
                            <Skeleton className="h-4 w-32" />
                          </td>
                          <td className="py-3 px-4">
                            <Skeleton className="h-6 w-20" />
                          </td>
                          <td className="py-3 px-4">
                            <Skeleton className="h-4 w-24" />
                          </td>
                          <td className="py-3 px-4">
                            <Skeleton className="h-4 w-24" />
                          </td>
                          <td className="py-3 px-4">
                            <Skeleton className="h-8 w-8 rounded-md" />
                          </td>
                        </tr>
                      ))
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <CenteredEmptyState
                          icon={
                            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          }
                          title={t("purchase.emptyTitle")}
                          subtitle={t("purchase.emptySubtitle")}
                        />
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        onClick={() => router.push(`/purchases/${item.id}`)}
                      >
                        <td className="py-3 px-4 text-gray-900 font-mono text-sm">
                          {item.id.slice(-8)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={getStatusBadgeClass(item.purchaseStatusCode)}
                          >
                            {t(
                              `purchase.status.${statusLabelKey(item.purchaseStatusCode)}`
                            )}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(item.createdAt).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(item.updatedAt).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeletingItem(item)
                            }}
                            className="hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          }
        >
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                {t("purchase.pagination.showing", {
                  from: (pagination.page - 1) * pagination.limit + 1,
                  to: Math.min(pagination.page * pagination.limit, pagination.total),
                  total: pagination.total,
                })}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={pagination.page === 1}
                >
                  {t("common.previous")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={pagination.page >= totalPages}
                >
                  {t("common.next")}
                </Button>
              </div>
            </div>
          )}
        </ListCardTable>
      </div>

      {deletingItem && (
        <DeleteConfirmDialog
          title={t("purchase.deleteConfirm.title")}
          description={t("purchase.deleteConfirm.description")}
          onConfirm={() => handleDelete(deletingItem)}
          onCancel={() => setDeletingItem(null)}
        />
      )}
    </>
  )
}
