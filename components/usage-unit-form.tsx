"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"

interface UsageUnit {
  id: string
  code: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

interface UsageUnitFormProps {
  unit?: UsageUnit | null
  onSave: (data: Omit<UsageUnit, "id" | "createdAt" | "updatedAt">) => void
  onCancel: () => void
}

export function UsageUnitForm({ unit, onSave, onCancel }: UsageUnitFormProps) {
  const [formData, setFormData] = useState({
    code: unit?.code || "",
    name: unit?.name || "",
    description: unit?.description || "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.code.trim()) {
      newErrors.code = "Unit code is required"
    } else if (formData.code.length > 10) {
      newErrors.code = "Unit code must be 10 characters or less"
    }

    if (!formData.name.trim()) {
      newErrors.name = "Unit name is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    onSave(formData)
    setIsLoading(false)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-gray-900">{unit ? "Edit Usage Unit" : "Add New Usage Unit"}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Unit Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                className={errors.code ? "border-red-500" : "border-yellow-200 focus:border-yellow-500"}
                placeholder="e.g., kg, l, pieces"
                maxLength={10}
              />
              {errors.code && <p className="text-sm text-red-600">{errors.code}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Unit Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={errors.name ? "border-red-500" : "border-yellow-200 focus:border-yellow-500"}
                placeholder="e.g., Kilogram, Liter, Pieces"
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="border-yellow-200 focus:border-yellow-500"
                placeholder="Optional description of the unit"
                rows={3}
              />
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
