"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Plus, Trash2 } from "lucide-react"
import { fetchInventories, InventoryItem } from "@/lib/inventory-api"
import { UsageUnit, Recipe, RecipePayload } from "@/lib/recipe-api"
import { useEffect } from "react"

interface RecipeFormProps {
  recipe?: Recipe | null
  onSave: (data: RecipePayload) => void
  onCancel: () => void
}

const units: UsageUnit[] = [
  { code: "kg", name: "Kilogram (kg)" },
  { code: "g", name: "Gram (g)" },
  { code: "l", name: "Liter (l)" },
  { code: "ml", name: "Milliliter (ml)" },
  { code: "pieces", name: "Pieces" },
  { code: "dozen", name: "Dozen" },
]

export function RecipeForm({ recipe, onSave, onCancel }: RecipeFormProps) {
  const blankInventory: InventoryItem = {
    createdAt: '',
    id: '',
    name: '',
    purchasePrice: 0,
    purchaseQuantity: 0,
    purchaseUnit: { code: '', name: '' },
    remark: '',
    updatedAt: '',
    yieldPercentage: 0,
  }
  const [formData, setFormData] = useState({
    name: recipe?.name || "",
    ingredients: recipe?.ingredients?.map(ing => ({
      inventory: ing.inventory,
      quantity: ing.quantity,
      unit: typeof ing.unit === 'string' ? { code: ing.unit } : ing.unit || { code: '' }
    })) || [{ inventory: blankInventory, quantity: 0, unit: { code: '' } }],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Add state for inventory search results and loading
  const [inventoryOptions, setInventoryOptions] = useState<InventoryItem[]>([])
  const [inventoryLoading, setInventoryLoading] = useState(false)
  const [inventorySearch, setInventorySearch] = useState<string>("")

  // Handler to search inventory
  const handleInventorySearch = async (search: string) => {
    setInventorySearch(search)
    setInventoryLoading(true)
    try {
      const items = await fetchInventories({ fields: "name,ingredients", search })
      setInventoryOptions(items)
    } catch (e) {
      setInventoryOptions([])
    } finally {
      setInventoryLoading(false)
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Recipe name is required"
    }

    if (formData.ingredients.length === 0) {
      newErrors.ingredients = "At least one ingredient is required"
    }

    formData.ingredients.forEach((ingredient, index) => {
      if (!ingredient.inventory) {
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

    onSave({
      name: formData.name,
      ingredients: formData.ingredients.map(ing => ({
        inventoryID: ing.inventory?.id || "",
        quantity: ing.quantity,
        unit: { code: ing.unit.code || "" }
      }))
    })
    setIsLoading(false)
  } 

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { inventory: blankInventory, quantity: 0, unit: { code: '' } }],
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
          if (field === "inventory") {
            const selectedInventory = inventoryOptions.find((item) => item.id === value)
            return {
              ...ingredient,
              inventory: selectedInventory || blankInventory,
            }
          }
          if (field === "unit") {
            return { ...ingredient, unit: { code: value } }
          }
          return { ...ingredient, [field]: value }
        }
        return ingredient
      }),
    }))

    // Clear related errors
    const errorKey = `ingredient_${index}_${field}`
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
                        <Input
                          placeholder="Search inventory..."
                          value={ingredient.inventory?.name || ""}
                          onChange={async (e) => {
                            const value = e.target.value
                            updateIngredient(index, "inventoryName", value)
                            await handleInventorySearch(value)
                          }}
                          className={
                            errors[`ingredient_${index}_inventory`]
                              ? "border-red-500"
                              : "border-yellow-200 focus:border-yellow-500"
                          }
                        />
                        <div className="relative">
                          {inventoryLoading && <div className="absolute left-0 top-0 text-xs text-gray-400">Searching...</div>}
                          {!inventoryLoading && inventoryOptions.length > 0 && (
                            <div className="absolute z-10 bg-white border border-gray-200 rounded shadow w-full max-h-40 overflow-y-auto">
                              {inventoryOptions.map((item) => (
                                <div
                                  key={item.id}
                                  className="px-3 py-2 hover:bg-yellow-50 cursor-pointer text-sm"
                                  onClick={() => {
                                    updateIngredient(index, "inventory", item.id)
                                    updateIngredient(index, "inventoryName", item.name)
                                    updateIngredient(index, "unit", item.purchaseUnit?.code || "")
                                    setInventoryOptions([])
                                  }}
                                >
                                  {item.name} {item.purchaseUnit?.name ? `(${item.purchaseUnit.name})` : ""}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
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
                          value={ingredient.unit.code}
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
                              <SelectItem key={unit.code} value={unit.code}>
                                {unit.name}
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
