"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search, Trash2, CheckSquare, Square, Receipt } from "lucide-react"
import { ListCardTable } from "@/components/list-card-table"
import { CenteredEmptyState } from "@/components/ui/CenteredEmptyState"
import { ReceiptForm } from "@/components/receipt-form"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { useToast } from "@/components/ui/use-toast"
import type { ShoppingOrder } from "@/types/shopping"
import { fetchShoppings, deleteShopping } from "@/lib/shopping-api"
import { useTranslation } from "@/hooks/use-translation"

export default function ShoppingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()
  const [items, setItems] = useState<ShoppingOrder[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showReceiptForm, setShowReceiptForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [deletingItem, setDeletingItem] = useState<ShoppingOrder | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchShoppings()
      .then((res) => {
        setItems(res.items)
        setTotalCount(res.meta?.total || res.items.length || 0)
      })
      .catch(() => toast({ title: t("common.error"), description: t("shopping.toast.fetchError") }))
      .finally(() => setLoading(false))
  }, [toast, t])

  const filteredItems = items.filter(item => {
    if (!searchTerm) return true
    const supplierName = item.supplierName || ""
    return supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleDelete = async (item: ShoppingOrder) => {
    if (!item) return
    setLoading(true)
    try {
      await deleteShopping(item.id)
      setItems(prev => prev.filter(i => i.id !== item.id))
      setTotalCount(prev => Math.max(0, prev - 1))
      toast({ title: t("common.success"), description: t("shopping.toast.deleted") })
    } catch (e: any) {
      toast({ title: t("common.error"), description: e?.message || t("shopping.toast.deleteError") })
      throw e
    } finally {
      setDeletingItem(null)
      setLoading(false)
    }
  }

  const getStatusBadgeClass = (statusCode: string) => {
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

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">{t("shopping.management")}</h1>
            </div>
            <p className="text-gray-600 mt-2">{t("shopping.subtitle")}</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={() => setShowReceiptForm(true)} variant="outline" className="border-yellow-500 text-yellow-600 hover:bg-yellow-50">
              <Receipt className="h-4 w-4 mr-2" />
              {t("shopping.readReceipt")}
            </Button>
            <Button onClick={() => router.push("/shopping/create")} className="bg-yellow-500 hover:bg-yellow-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              {t("shopping.addItem")}
            </Button>
          </div>
        </div>

        <ListCardTable
          title={
            <div className="flex items-center">
              <span>{t("shopping.listTitle")}</span>
              <span className="ml-2 text-sm text-gray-500">({totalCount} {t("common.list")})</span>
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
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t("shopping.supplier")}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t("shopping.status")}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t("shopping.createdAt")}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array(5).fill(0).map((_, index) => (
                      <tr key={`skeleton-${index}`} className="border-b border-gray-100">
                        <td className="py-3 px-4"><Skeleton className="h-4 w-32" /></td>
                        <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                        <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="py-3 px-4"><Skeleton className="h-8 w-8 rounded-md" /></td>
                      </tr>
                    ))
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={4}>
                        <CenteredEmptyState
                          icon={<Square className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
                          title={t("shopping.emptyTitle")}
                          subtitle={t("shopping.emptySubtitle")}
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        onClick={() => router.push(`/shopping/${item.id}`)}
                      >
                        <td className="py-3 px-4 text-gray-900 font-medium">{item.supplierName || "-"}</td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary" className={getStatusBadgeClass(item.status.code)}>
                            {item.status.name}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(item.createdAt).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
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
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          }
        />
      </div>



      {showReceiptForm && (
        <ReceiptForm
          onCancel={() => setShowReceiptForm(false)}
        />
      )}

      {deletingItem && (
        <DeleteConfirmDialog
          title={t("shopping.deleteConfirm.title")}
          description={t("shopping.deleteConfirm.description", { name: deletingItem.supplierName })}
          onConfirm={() => handleDelete(deletingItem)}
          onCancel={() => setDeletingItem(null)}
        />
      )}
    </>
  )
}
