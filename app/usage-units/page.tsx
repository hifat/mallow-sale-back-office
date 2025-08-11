"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Scale } from "lucide-react"
import { UsageUnitForm } from "@/components/usage-unit-form"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { ProductCard, ProductCardActions } from "@/components/product-card";
import { CenteredEmptyState } from "@/components/ui/CenteredEmptyState";

interface UsageUnit {
  id: string
  code: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

const mockUsageUnits: UsageUnit[] = [
  {
    id: "1",
    code: "kg",
    name: "Kilogram",
    description: "Unit of mass equal to 1000 grams",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "2",
    code: "g",
    name: "Gram",
    description: "Basic unit of mass in the metric system",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "3",
    code: "l",
    name: "Liter",
    description: "Unit of volume equal to 1000 milliliters",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "4",
    code: "ml",
    name: "Milliliter",
    description: "Unit of volume equal to 1/1000 of a liter",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "5",
    code: "pcs",
    name: "Pieces",
    description: "Individual countable items",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
]

export default function UsageUnitsPage() {
  const [units, setUnits] = useState<UsageUnit[]>(mockUsageUnits)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingUnit, setEditingUnit] = useState<UsageUnit | null>(null)
  const [deletingUnit, setDeletingUnit] = useState<UsageUnit | null>(null)

  const filteredUnits = units.filter(
    (unit) =>
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSave = (data: Omit<UsageUnit, "id" | "createdAt" | "updatedAt">) => {
    if (editingUnit) {
      setUnits((prev) =>
        prev.map((unit) =>
          unit.id === editingUnit.id ? { ...unit, ...data, updatedAt: new Date().toISOString().split("T")[0] } : unit,
        ),
      )
    } else {
      const newUnit: UsageUnit = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      }
      setUnits((prev) => [...prev, newUnit])
    }
    setShowForm(false)
    setEditingUnit(null)
  }

  const handleDelete = (unit: UsageUnit) => {
    setUnits((prev) => prev.filter((u) => u.id !== unit.id))
    setDeletingUnit(null)
  }

  const handleEdit = (unit: UsageUnit) => {
    setEditingUnit(unit)
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usage Units Management</h1>
          <p className="text-gray-600 mt-2">Manage measurement units for inventory and recipes</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-yellow-500 hover:bg-yellow-600 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Unit
        </Button>
      </div>

      <Card className="border-yellow-200">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center">
            <Scale className="h-5 w-5 mr-2 text-yellow-600" />
            Usage Units
          </CardTitle>
          <div className="flex items-center space-x-2 pt-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search units..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-yellow-200 focus:border-yellow-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUnits.map((unit) => (
              <ProductCard
                key={unit.id}
                title={unit.name}
                badge={
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 mb-2">
                    {unit.code}
                  </Badge>
                }
                actions={
                  <ProductCardActions>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(unit)} className="hover:bg-yellow-50">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingUnit(unit)}
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </ProductCardActions>
                }
                className=""
              >
                {unit.description && <p className="text-sm text-gray-600 mb-3">{unit.description}</p>}
                <div className="text-xs text-gray-500">Updated: {unit.updatedAt}</div>
              </ProductCard>
            ))}
          </div>

          {filteredUnits.length === 0 && (
            <CenteredEmptyState
              icon={<Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
              title="No usage units found"
              subtitle="Add your first usage unit to get started"
            />
          )}
        </CardContent>
      </Card>

      {showForm && (
        <UsageUnitForm
          unit={editingUnit}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingUnit(null)
          }}
        />
      )}

      {deletingUnit && (
        <DeleteConfirmDialog
          title="Delete Usage Unit"
          description={`Are you sure you want to delete "${deletingUnit.name}" (${deletingUnit.code})? This action cannot be undone and may affect existing inventory items and recipes.`}
          onConfirm={() => handleDelete(deletingUnit)}
          onCancel={() => setDeletingUnit(null)}
        />
      )}
    </div>
  )
}
