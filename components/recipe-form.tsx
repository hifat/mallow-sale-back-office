"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Plus, Trash2 } from "lucide-react"

interface Recipe {
  id: string
  name: string
  ingredients: Array<{
    inventoryId: string
    inventoryName: string
    quantity: number
    unit: string
  }>
  createdAt: string
  updatedAt: string
}

interface RecipeFormProps {
  recipe?: Recipe | null
  onSave: (data: Omit<Recipe, "id" | "createdAt" | "updatedAt">) => void
  onCancel: () => void
}

// Mock inventory data
const mockInventory = [
  { id: "1", name: "Premium Flour", unit: "kg" },
  { id: "2", name: "Organic Sugar", unit: "kg" },
  { id: "3", name: "Vanilla Extract", unit: "l" },
  { id: "4", name: "Butter", unit: "kg" },
  { id: "5", name: "Eggs", unit: "pieces" },
]

const units = [
  { value: "kg", label: "Kilogram (kg)" },
  { value: "g", label: "Gram (g)" },
  { value: "l", label: "Liter (l)" },
  { value: "ml", label: "Milliliter (ml)" },
  { value: "pieces", label: "Pieces" },
  { value: "dozen", label: "Dozen" },
]

export function RecipeForm({ recipe, onSave, onCancel }: RecipeFormProps) {
  const [formData, setFormData] = useState({
    name: recipe?.name || "",
    ingredients: recipe?.ingredients || [{ inventoryId: "", inventoryName: "", quantity: 0, unit: "" }],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Recipe name is required"
    }

    if (formData.ingredients.length === 0) {
      newErrors.ingredients = "At least one ingredient is required"
    }

    formData.ingredients.forEach((ingredient, index) => {
      if (!ingredient.inventoryId) {
        newErrors[`ingredient_${index}_inventory`] = "Please select an inventory item"
      }
      if (ingredient.quantity <= 0) {
        newErrors[`ingredient_${index}_quantity`] = "Quantity must be greater than 0"
      }
      if (!ingredient.unit) {
        newErrors[`ingredient_${index}_unit`] = "Please select a unit"
      }
    })

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

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { inventoryId: "", inventoryName: "", quantity: 0, unit: "" }],
    }))
  }

  const removeIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }))
  }

  const updateIngredient = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient, i) => {
        if (i === index) {
          if (field === "inventoryId") {
            const selectedInventory = mockInventory.find((item) => item.id === value)
            return {
              ...ingredient,
              inventoryId: value,
              inventoryName: selectedInventory?.name || "",
              unit: selectedInventory?.unit || ingredient.unit,
            }
          }
          return { ...ingredient, [field]: value }
        }
        return ingredient
      }),
    }))

    // Clear related errors
    const errorKey = `ingredient_${index}_${field === "inventoryId" ? "inventory" : field}`
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: "" }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-gray-900">{recipe ? "Edit Recipe" : "Add New Recipe"}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Recipe Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className={errors.name ? "border-red-500" : "border-yellow-200 focus:border-yellow-500"}
                placeholder="Enter recipe name"
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-medium">Ingredients</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addIngredient}
                  className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 bg-transparent"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Ingredient
                </Button>
              </div>

              {formData.ingredients.map((ingredient, index) => (
                <Card key={index} className="border-gray-200">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Inventory Item *</Label>
                        <Select
                          value={ingredient.inventoryId}
                          onValueChange={(value) => updateIngredient(index, "inventoryId", value)}
                        >
                          <SelectTrigger
                            className={
                              errors[`ingredient_${index}_inventory`]
                                ? "border-red-500"
                                : "border-yellow-200 focus:border-yellow-500"
                            }
                          >
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockInventory.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors[`ingredient_${index}_inventory`] && (
                          <p className="text-sm text-red-600">{errors[`ingredient_${index}_inventory`]}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Quantity *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={ingredient.quantity}
                          onChange={(e) => updateIngredient(index, "quantity", Number.parseFloat(e.target.value) || 0)}
                          className={
                            errors[`ingredient_${index}_quantity`]
                              ? "border-red-500"
                              : "border-yellow-200 focus:border-yellow-500"
                          }
                          placeholder="0"
                        />
                        {errors[`ingredient_${index}_quantity`] && (
                          <p className="text-sm text-red-600">{errors[`ingredient_${index}_quantity`]}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Unit *</Label>
                        <Select
                          value={ingredient.unit}
                          onValueChange={(value) => updateIngredient(index, "unit", value)}
                        >
                          <SelectTrigger
                            className={
                              errors[`ingredient_${index}_unit`]
                                ? "border-red-500"
                                : "border-yellow-200 focus:border-yellow-500"
                            }
                          >
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {units.map((unit) => (
                              <SelectItem key={unit.value} value={unit.value}>
                                {unit.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors[`ingredient_${index}_unit`] && (
                          <p className="text-sm text-red-600">{errors[`ingredient_${index}_unit`]}</p>
                        )}
                      </div>

                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIngredient(index)}
                          className="hover:bg-red-50 hover:text-red-600"
                          disabled={formData.ingredients.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {errors.ingredients && <p className="text-sm text-red-600">{errors.ingredients}</p>}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Recipe"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
