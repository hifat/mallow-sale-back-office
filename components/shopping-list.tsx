"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search, Trash2, CheckSquare, Square } from "lucide-react"
import { ListCardTable } from "@/components/list-card-table";
import { CenteredEmptyState } from "@/components/ui/CenteredEmptyState";
import { ShoppingForm } from "@/components/shopping-form";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { useToast } from "@/components/ui/use-toast";
import type { Shopping } from "@/types/shopping";
import { fetchShoppings, createShopping, deleteShopping, updateShoppingIsComplete } from "@/lib/shopping-api";
import { useTranslation } from "@/hooks/use-translation";

export function ShoppingList() {
  const { toast } = useToast()
  const { t } = useTranslation()
  const [items, setItems] = useState<Shopping[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [deletingItem, setDeletingItem] = useState<Shopping | null>(null)

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

  const filteredItems = items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleCreate = async (data: Omit<Shopping, "id">) => {
    setLoading(true)
    try {
      await createShopping(data as any)
      const res = await fetchShoppings()
      setItems(res.items)
      setTotalCount(res.meta?.total || res.items.length || 0)
      toast({ title: t("common.success"), description: t("shopping.toast.added") })
    } catch (e: any) {
      toast({ title: t("common.error"), description: e?.message || t("shopping.toast.createError") })
      throw e
    } finally {
      setShowForm(false)
      setLoading(false)
    }
  }

  const handleToggleComplete = async (item: Shopping) => {
    const newVal = !item.isComplete
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, isComplete: newVal } : i))
    try {
      await updateShoppingIsComplete(item.id, newVal)
    } catch (e) {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, isComplete: item.isComplete } : i))
      toast({ title: t("common.error"), description: t("shopping.toast.updateError") })
    }
  }

  const handleDelete = async (item: Shopping) => {
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
          <Button onClick={() => setShowForm(true)} className="bg-yellow-500 hover:bg-yellow-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            {t("shopping.addItem")}
          </Button>
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
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t("shopping.complete")}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t("common.name")}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t("inventory.quantity")}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t("inventory.unit")}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array(5).fill(0).map((_, index) => (
                      <tr key={`skeleton-${index}`} className="border-b border-gray-100">
                        <td className="py-3 px-4"><Skeleton className="h-4 w-6" /></td>
                        <td className="py-3 px-4"><Skeleton className="h-4 w-32" /></td>
                        <td className="py-3 px-4"><Skeleton className="h-4 w-12" /></td>
                        <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                        <td className="py-3 px-4"><Skeleton className="h-8 w-8 rounded-md" /></td>
                      </tr>
                    ))
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <CenteredEmptyState
                          icon={<Square className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
                          title={t("shopping.emptyTitle")}
                          subtitle={t("shopping.emptySubtitle")}
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm" onClick={() => handleToggleComplete(item)} className="hover:bg-yellow-50">
                            {item.isComplete ? <CheckSquare className="h-4 w-4 text-green-600" /> : <Square className="h-4 w-4 text-gray-500" />}
                          </Button>
                        </td>
                        <td className="py-3 px-4 text-gray-900">{item.name}</td>
                        <td className="py-3 px-4 text-gray-900">{item.purchaseQuantity}</td>
                        <td className="py-3 px-4">
                          {item.purchaseUnit?.name || item.purchaseUnit?.code ? (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              {item.purchaseUnit?.name || item.purchaseUnit?.code}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-500">-</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingItem(item)}
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

      {showForm && (
        <ShoppingForm
          onSave={handleCreate as any}
          onCancel={() => setShowForm(false)}
        />
      )}

      {deletingItem && (
        <DeleteConfirmDialog
          title="Delete Shopping Item"
          description={`Are you sure you want to delete "${deletingItem.name}"? This action cannot be undone.`}
          onConfirm={() => handleDelete(deletingItem)}
          onCancel={() => setDeletingItem(null)}
        />
      )}
    </>
  )
}


