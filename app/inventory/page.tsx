"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react"
import { InventoryForm } from "@/components/inventory-form"
import { InventoryDetails } from "@/components/inventory-details"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"

interface InventoryItem {
  id: string
  name: string
  purchasePrice: number
  purchaseQuantity: number
  purchaseUnit: string
  yieldPercentage: number
  remark?: string
  createdAt: string
  updatedAt: string
}

const mockInventory: InventoryItem[] = [
  {
    id: "1",
    name: "Premium Flour",
    purchasePrice: 25.5,
    purchaseQuantity: 50,
    purchaseUnit: "kg",
    yieldPercentage: 95,
    remark: "High quality wheat flour",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
  },
  {
    id: "2",
    name: "Organic Sugar",
    purchasePrice: 45.0,
    purchaseQuantity: 25,
    purchaseUnit: "kg",
    yieldPercentage: 100,
    remark: "Certified organic",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-18",
  },
  {
    id: "3",
    name: "Vanilla Extract",
    purchasePrice: 120.0,
    purchaseQuantity: 2,
    purchaseUnit: "l",
    yieldPercentage: 98,
    createdAt: "2024-01-12",
    updatedAt: "2024-01-19",
  },
]

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null)

  const filteredInventory = inventory.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleSave = (data: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">) => {
    if (editingItem) {
      setInventory((prev) =>
        prev.map((item) =>
          item.id === editingItem.id ? { ...item, ...data, updatedAt: new Date().toISOString().split("T")[0] } : item,
        ),
      )
    } else {
      const newItem: InventoryItem = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      }
      setInventory((prev) => [...prev, newItem])
    }
    setShowForm(false)
    setEditingItem(null)
  }

  const handleDelete = (item: InventoryItem) => {
    setInventory((prev) => prev.filter((i) => i.id !== item.id))
    setDeletingItem(null)
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-2">Manage your inventory items and stock levels</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-yellow-500 hover:bg-yellow-600 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <Card className="border-yellow-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Inventory Items</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-yellow-200 focus:border-yellow-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Price</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Quantity</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Unit</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Yield %</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Updated</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        {item.remark && <p className="text-sm text-gray-600">{item.remark}</p>}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900">${item.purchasePrice.toFixed(2)}</td>
                    <td className="py-3 px-4 text-gray-900">{item.purchaseQuantity}</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        {item.purchaseUnit}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{item.yieldPercentage}%</td>
                    <td className="py-3 px-4 text-gray-600">{item.updatedAt}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <InventoryForm
          item={editingItem}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingItem(null)
          }}
        />
      )}

      {showDetails && (
        <InventoryDetails
          item={inventory.find((i) => i.id === showDetails)!}
          onClose={() => setShowDetails(null)}
          onEdit={(item) => {
            setShowDetails(null)
            handleEdit(item)
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
    </div>
  )
}
