"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search, Edit, Trash2, Eye, Package } from "lucide-react"
import { InventoryForm } from "@/components/inventory-form"
import { InventoryDetails } from "@/components/inventory-details"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import {
  fetchInventories,
  createInventory,
  updateInventory,
  deleteInventory,
} from "@/lib/inventory-api"
import { InventoryItem } from "@/types/inventory"
import { formatDate, calculateActualPrice, calculateCostPerUnit } from "@/lib/utils"
import { ListCardTable } from "@/components/list-card-table";
import { CenteredEmptyState } from "@/components/ui/CenteredEmptyState";
import { useTranslation } from "@/hooks/use-translation";

export default function InventoryPage() {
  const { t } = useTranslation()
  const [inventories, setInventory] = useState<InventoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    setLoading(true)
    fetchInventories()
      .then((response) => {
        setInventory(response.items)
        setTotalCount(response.meta?.total || 0)
      })
      .catch((e) => console.error("Failed to fetch inventory:", e))
      .finally(() => setLoading(false))
  }, [])

  const filteredInventory = inventories.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const handleSave = async (data: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">) => {
    setLoading(true)
    try {
      if (editingItem) {
        await updateInventory(editingItem.id, data)
        setInventory(prev =>
          prev.map(item =>
            item.id === editingItem.id 
              ? { 
                  ...item, 
                  ...data, 
                  updatedAt: new Date().toISOString().split("T")[0] 
                } 
              : item
          )
        )
      } else {
        await createInventory(data)
        // Refetch to ensure all data is up-to-date
        const res = await fetchInventories()
        setInventory(res.items)
      }
    } catch (error) {
      console.error("Error saving inventory:", error)
      throw error // Re-throw to let the form handle the error
    } finally {
      setShowForm(false)
      setEditingItem(null)
      setLoading(false)
    }
  }

  const handleDelete = async (item: InventoryItem) => {
    if (!item) return
    
    setLoading(true)
    try {
      await deleteInventory(item.id)
      setInventory(prev => prev.filter(i => i.id !== item.id))
    } catch (error) {
      console.error("Error deleting inventory:", error)
      throw error // Re-throw to let the dialog handle the error
    } finally {
      setDeletingItem(null)
      setLoading(false)
    }
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item)
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
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">{t("inventory.management")}</h1>
            </div>
            <p className="text-gray-600 mt-2">{t("inventory.subtitle")}</p>
          </div>
          <Button onClick={handleOpenForm} className="bg-yellow-500 hover:bg-yellow-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            {t("inventory.addItem")}
          </Button>
        </div>

        <ListCardTable
          title={
            <div className="flex items-center">
              <span>{t("inventory.title")}</span>
              <span className="ml-2 text-sm text-gray-500">
                ({totalCount} {t("common.list")})
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
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t("common.name")}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t("inventory.price")}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t("inventory.yield")}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t("inventory.actualPrice")}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t("inventory.costPerUnit")}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t("inventory.quantity")}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t("inventory.unit")}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t("dashboard.updated")}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    // Skeleton loading state
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
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="py-3 px-4">
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="py-3 px-4">
                          <Skeleton className="h-4 w-16" />
                        </td>
                        <td className="py-3 px-4">
                          <Skeleton className="h-4 w-12" />
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
                  ) : filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={9}>
                        <CenteredEmptyState
                          icon={<Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
                          title={t("inventory.emptyTitle")}
                          subtitle={t("inventory.emptySubtitle")}
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            {item.remark && <p className="text-sm text-gray-600">{item.remark}</p>}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-900">฿{item.purchasePrice}</td>
                        <td className="py-3 px-4 text-gray-900">{item.yieldPercentage}%</td>
                        <td className="py-3 px-4 text-gray-900">฿{calculateActualPrice(item.purchasePrice, item.yieldPercentage).toFixed(2)}</td>
                        <td className="py-3 px-4 text-gray-900">฿{calculateCostPerUnit(item.purchasePrice, item.purchaseQuantity).toFixed(2)}</td>
                        <td className="py-3 px-4 text-gray-900">{item.purchaseQuantity}</td>
                        <td className="py-3 px-4">
                          {item.purchaseUnit?.name ? (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              {item.purchaseUnit.name}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-500">
                              -
                            </Badge>
                          )}
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
        <InventoryForm
          item={editingItem || undefined}
          onSave={handleSave as any}
          onCancel={() => {
            setShowForm(false)
            setEditingItem(null)
          }}
        />
      )}

      {showDetails && (
        <InventoryDetails
          item={inventories.find((i) => i.id === showDetails)!}
          onClose={() => setShowDetails(null)}
          onEdit={(item) => {
            setShowDetails(null)
            handleEdit(item as any)
          }}
        />
      )}

      {deletingItem && (
        <DeleteConfirmDialog
          title="Delete Inventory Item"
          description={`Are you sure you want to delete "${deletingItem.name}"? This action cannot be undone.`}
          onConfirm={() => handleDelete(deletingItem)}
          onCancel={() => setDeletingItem(null)}
        />
      )}
    </>
  )
}
