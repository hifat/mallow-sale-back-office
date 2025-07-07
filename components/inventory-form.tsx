"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"

interface UsageUnit {
  code: string
  name: string
}

interface InventoryItem {
  id: string
  name: string
  purchasePrice: number
  purchaseQuantity: number
  purchaseUnit: UsageUnit
  yieldPercentage: number
  remark?: string
  createdAt: string
  updatedAt: string
}

interface InventoryFormProps {
  item?: InventoryItem | null
  onSave: (data: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">) => void
  onCancel: () => void
}

const units: UsageUnit[] = [
  { code: "kg", name: "Kilogram (kg)" },
  { code: "g", name: "Gram (g)" },
  { code: "l", name: "Liter (l)" },
  { code: "ml", name: "Milliliter (ml)" },
  { code: "pieces", name: "Pieces" },
  { code: "dozen", name: "Dozen" },
  { code: "box", name: "Box" },
  { code: "bag", name: "Bag" },
]

export function InventoryForm({ item, onSave, onCancel }: InventoryFormProps) {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    purchasePrice: item?.purchasePrice || 0,
    purchaseQuantity: item?.purchaseQuantity || 0,
    purchaseUnit: item?.purchaseUnit?.code || "",
    yieldPercentage: item?.yieldPercentage || 0,
    remark: item?.remark || "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }
    if (formData.purchasePrice <= 0) {
      newErrors.purchasePrice = "Purchase price must be greater than 0"
    }
    if (formData.purchaseQuantity <= 0) {
      newErrors.purchaseQuantity = "Purchase quantity must be greater than 0"
    }
    if (!formData.purchaseUnit) {
      newErrors.purchaseUnit = "Purchase unit is required"
    }
    if (formData.yieldPercentage < 0 || formData.yieldPercentage > 100) {
      newErrors.yieldPercentage = "Yield percentage must be between 0 and 100"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsLoading(true)

    // Find the selected unit object
    const selectedUnit = units.find((u) => u.code === formData.purchaseUnit) || { code: formData.purchaseUnit, name: formData.purchaseUnit }
    onSave({
      ...formData,
      purchaseUnit: selectedUnit,
    })
    setIsLoading(false)
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-gray-900">{item ? "Edit Inventory Item" : "Add New Inventory Item"}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={errors.name ? "border-red-500" : "border-yellow-200 focus:border-yellow-500"}
                  placeholder="Enter item name"
                />
                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price ($) *</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.purchasePrice}
                  onChange={(e) => handleChange("purchasePrice", Number.parseFloat(e.target.value) || 0)}
                  className={errors.purchasePrice ? "border-red-500" : "border-yellow-200 focus:border-yellow-500"}
                  placeholder="0.00"
                />
                {errors.purchasePrice && <p className="text-sm text-red-600">{errors.purchasePrice}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchaseQuantity">Purchase Quantity *</Label>
                <Input
                  id="purchaseQuantity"
                  type="number"
                  min="0"
                  value={formData.purchaseQuantity}
                  onChange={(e) => handleChange("purchaseQuantity", Number.parseInt(e.target.value) || 0)}
                  className={errors.purchaseQuantity ? "border-red-500" : "border-yellow-200 focus:border-yellow-500"}
                  placeholder="0"
                />
                {errors.purchaseQuantity && <p className="text-sm text-red-600">{errors.purchaseQuantity}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchaseUnit">Purchase Unit *</Label>
                <Select value={formData.purchaseUnit} onValueChange={(value) => handleChange("purchaseUnit", value)}>
                  <SelectTrigger
                    className={errors.purchaseUnit ? "border-red-500" : "border-yellow-200 focus:border-yellow-500"}
                  >
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit.code} value={unit.code}>
                        {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.purchaseUnit && <p className="text-sm text-red-600">{errors.purchaseUnit}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="yieldPercentage">Yield Percentage (%) *</Label>
                <Input
                  id="yieldPercentage"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.yieldPercentage}
                  onChange={(e) => handleChange("yieldPercentage", Number.parseFloat(e.target.value) || 0)}
                  className={errors.yieldPercentage ? "border-red-500" : "border-yellow-200 focus:border-yellow-500"}
                  placeholder="0"
                />
                {errors.yieldPercentage && <p className="text-sm text-red-600">{errors.yieldPercentage}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="remark">Remark</Label>
                <Textarea
                  id="remark"
                  value={formData.remark}
                  onChange={(e) => handleChange("remark", e.target.value)}
                  className="border-yellow-200 focus:border-yellow-500"
                  placeholder="Optional remarks or notes"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
