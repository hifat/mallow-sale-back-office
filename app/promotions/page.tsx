"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search, Edit, Trash2, Eye, Tag } from "lucide-react"
import { PromotionForm } from "@/components/promotion-form"
import { PromotionDetails } from "@/components/promotion-details"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import {
  fetchPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  Promotion,
} from "@/lib/promotion-api"
import { formatDate } from "@/lib/utils"
import { ListCardTable } from "@/components/list-card-table";
import { CenteredEmptyState } from "@/components/ui/CenteredEmptyState";
import { useTranslation } from "@/hooks/use-translation";

export default function PromotionsPage() {
  const { t } = useTranslation()
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState<string | null>(null)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)
  const [deletingPromotion, setDeletingPromotion] = useState<Promotion | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchPromotions()
      .then((res) => setPromotions(res.items))
      .catch((e) => console.error("Failed to fetch promotions:", e))
      .finally(() => setLoading(false))
  }, [])

  const filteredPromotions = promotions.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSave = async (data: Omit<Promotion, "id" | "createdAt" | "updatedAt">) => {
    setLoading(true)
    try {
      // Transform products to string IDs for API
      const payload = {
        ...data,
        products: Array.isArray(data.products)
          ? data.products.map((p: any) => typeof p === "string" ? p : p.id)
          : [],
      };
      if (editingPromotion) {
        await updatePromotion(editingPromotion.id, payload)
        setPromotions(prev =>
          prev.map(item =>
            item.id === editingPromotion.id
              ? {
                ...item,
                ...data,
                updatedAt: new Date().toISOString().split("T")[0]
              }
              : item
          )
        )
      } else {
        await createPromotion(payload)
        // Refetch to ensure all data is up-to-date
        const latestPromotions = await fetchPromotions()
        setPromotions(latestPromotions.items)
      }
    } catch (error) {
      console.error("Error saving promotion:", error)
      throw error // Re-throw to let the form handle the error
    } finally {
      setShowForm(false)
      setEditingPromotion(null)
      setLoading(false)
    }
  }

  const handleDelete = async (item: Promotion) => {
    if (!item) return
    setLoading(true)
    try {
      await deletePromotion(item.id)
      setPromotions(prev => prev.filter(i => i.id !== item.id))
    } catch (error) {
      console.error("Error deleting promotion:", error)
      throw error // Re-throw to let the dialog handle the error
    } finally {
      setDeletingPromotion(null)
      setLoading(false)
    }
  }

  const handleEdit = (item: Promotion) => {
    setEditingPromotion(item)
    setShowForm(true)
  }

  const handleOpenForm = () => {
    setShowForm(true)
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t("promotions.management")}</h1>
            <p className="text-gray-600 mt-2">{t("promotions.subtitle")}</p>
          </div>
          <Button onClick={handleOpenForm} className="bg-yellow-500 hover:bg-yellow-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            {t("promotions.addItem")}
          </Button>
        </div>

        <ListCardTable
          title={t("promotions.title")}
          search={
            <div className="relative flex-1 max-w-sm">
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
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t("common.name")}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t("promotions.type")}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t("promotions.value")}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t("dashboard.updated")}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array(5).fill(0).map((_, index) => (
                      <tr key={`skeleton-${index}`} className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <Skeleton className="h-4 w-32" />
                        </td>
                        <td className="py-3 px-4">
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="py-3 px-4">
                          <Skeleton className="h-4 w-16" />
                        </td>
                        <td className="py-3 px-4">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Skeleton className="h-8 w-8 rounded-md" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : filteredPromotions.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <CenteredEmptyState
                          icon={<Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
                          title={t("promotions.emptyTitle")}
                          subtitle={t("promotions.emptySubtitle")}
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredPromotions.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            {item.detail && <p className="text-sm text-gray-600">{item.detail}</p>}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            {item.type?.name || item.type?.code}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {item.type?.code === 'DISCOUNT' && item.discount ? `${item.discount}%` :
                            item.type?.code === 'FORCE_PRICE' && item.price ? `฿${item.price}` :
                              item.type?.code === 'PAIR' ? t("promotions.pairDeal") :
                                "-"}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{formatDate(item.updatedAt)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowDetails(item.id)}
                              className="hover:bg-yellow-50"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item)}
                              className="hover:bg-yellow-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingPromotion(item)}
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
        <PromotionForm
          promotion={editingPromotion || undefined}
          onSave={handleSave as any}
          onCancel={() => {
            setShowForm(false)
            setEditingPromotion(null)
          }}
        />
      )}

      {showDetails && (
        <PromotionDetails
          promotionId={showDetails}
          onClose={() => setShowDetails(null)}
        />
      )}

      {deletingPromotion && (
        <DeleteConfirmDialog
          title={t("promotions.deleteConfirm.title")}
          description={t("promotions.deleteConfirm.description", { name: deletingPromotion.name })}
          onConfirm={() => handleDelete(deletingPromotion)}
          onCancel={() => setDeletingPromotion(null)}
        />
      )}
    </>
  )
}
