"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Plus, Trash2, Tag } from "lucide-react"
import { fetchInventories, InventoryItem } from "@/lib/inventory-api"
import { Recipe, RecipePayload } from "@/lib/recipe-api"
import { UsageUnit } from "@/lib/inventory-api"
import { calculateActualPrice, calculateCostPerUnit, calculateReasonablePriceForSale } from "@/lib/utils"
import { fetchSettings } from "@/lib/setting-api"

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
    costPercentage: recipe?.costPercentage ?? 0,
    price: recipe?.price ?? 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Add state for inventory search results and loading
  const [inventoryOptions, setInventoryOptions] = useState<InventoryItem[]>([])
  const [inventoryLoading, setInventoryLoading] = useState(false)
  const [inventorySearch, setInventorySearch] = useState<string>("")
  const [activeIngredientIndex, setActiveIngredientIndex] = useState<number | null>(null)
  const [searchText, setSearchText] = useState<string[]>([])

  // On mount or when editing a recipe, initialize ingredient inventory objects from recipe.ingredients directly
  useEffect(() => {
    if (recipe && recipe.ingredients) {
      setFormData((prev) => ({
        ...prev,
        ingredients: recipe.ingredients.map((ing) => ({
          inventory: ing.inventory || blankInventory,
          quantity: ing.quantity,
          unit: typeof ing.unit === 'string' ? { code: ing.unit } : ing.unit || { code: '' }
        }))
      }))
      setSearchText(recipe.ingredients.map((ing) => ing.inventory?.name || ""))
    } else {
      // On create, fetch default costPercentage from settings
      fetchSettings()
        .then((settings) => {
          setFormData((prev) => ({ ...prev, costPercentage: settings.costPercentage ?? 0 }))
        })
        .catch(() => {})
      setSearchText([""])
    }
  }, [recipe])

  // Handler to search inventory
  const handleInventorySearch = async (search: string, index: number) => {
    setActiveIngredientIndex(index)
    setInventoryLoading(true)
    try {
      const items = await fetchInventories({ fields: "name,ingredients,purchase_price,yield_percentage,purchase_quantity", search })
      setInventoryOptions(items)
    } catch (e) {
      setInventoryOptions([])
    } finally {
      setInventoryLoading(false)
    }
  }

  // Update searchText for a specific ingredient
  const updateSearchText = (index: number, value: string) => {
    setSearchText((prev) => {
      const updated = [...prev]
      updated[index] = value
      return updated
    })
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Recipe name is required"
    }
    if (isNaN(formData.costPercentage) || formData.costPercentage < 0 || formData.costPercentage > 100) {
      newErrors.costPercentage = "Cost percentage must be a number between 0 and 100"
    }
    if (isNaN(formData.price) || formData.price < 0) {
      newErrors.price = "Price must be a number greater than or equal to 0"
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
      })),
      costPercentage: formData.costPercentage,
      price: formData.price,
    })
    setIsLoading(false)
  } 

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { inventory: blankInventory, quantity: 0, unit: { code: '' } }],
    }))
    setSearchText((prev) => [...prev, ""])
  }

  const removeIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }))
    setSearchText((prev) => prev.filter((_, i) => i !== index))
  }

  const updateIngredient = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient, i) => {
        if (i === index) {
          if (field === "inventory") {
            const selectedInventory = inventoryOptions.find((item) => item.id === value)
            if (selectedInventory) {
              updateSearchText(index, selectedInventory.name)
            }
            return {
              ...ingredient,
              inventory: selectedInventory || blankInventory,
            }
          }
          if (field === "unit") {
            return { ...ingredient, unit: { code: value } }
          }
          if (field === "inventoryName") {
            updateSearchText(index, value)
            return ingredient
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

            <div className="flex flex-col md:flex-row md:space-x-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="costPercentage">Cost Percentage (%)</Label>
                <Input
                  id="costPercentage"
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  value={formData.costPercentage}
                  onChange={e => setFormData(prev => ({ ...prev, costPercentage: parseFloat(e.target.value) }))}
                  className={errors.costPercentage ? "border-red-500" : "border-yellow-200 focus:border-yellow-500"}
                  placeholder="Enter cost percentage"
                />
                {errors.costPercentage && <p className="text-sm text-red-600">{errors.costPercentage}</p>}
              </div>
              <div className="flex-1 space-y-2 mt-2 md:mt-0">
                <Label htmlFor="price">Selling Price</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.price}
                  onChange={e => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  className={errors.price ? "border-red-500" : "border-yellow-200 focus:border-yellow-500"}
                  placeholder="Enter selling price"
                />
                {errors.price && <p className="text-sm text-red-600">{errors.price}</p>}
              </div>
            </div>

            {/* Reasonable Price for Sale Preview */}
            {(() => {
              let totalCost = 0;
              for (const ingredient of formData.ingredients) {
                if (
                  ingredient.inventory &&
                  ingredient.inventory.purchasePrice &&
                  ingredient.inventory.purchaseQuantity &&
                  ingredient.inventory.yieldPercentage !== undefined
                ) {
                  const actualPrice = calculateActualPrice(
                    ingredient.inventory.purchasePrice,
                    ingredient.inventory.yieldPercentage
                  );
                  const costPerUnit = calculateCostPerUnit(actualPrice, ingredient.inventory.purchaseQuantity);
                  totalCost += costPerUnit * ingredient.quantity;
                }
              }
              let reasonablePrice = calculateReasonablePriceForSale(totalCost, formData.costPercentage);
              if (!reasonablePrice || isNaN(reasonablePrice) || reasonablePrice === Infinity) reasonablePrice = 0;
              return (
                <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg mb-2 mt-2">
                  <Tag className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Reasonable Price for Sale</p>
                    <p className="text-lg font-semibold text-gray-900">฿{reasonablePrice.toFixed(2)}</p>
                  </div>
                </div>
              );
            })()}

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
                          value={searchText[index] || ""}
                          onFocus={() => setActiveIngredientIndex(index)}
                          onBlur={() => setTimeout(() => setActiveIngredientIndex(null), 200)}
                          onChange={async (e) => {
                            const value = e.target.value
                            updateIngredient(index, "inventoryName", value)
                            await handleInventorySearch(value, index)
                          }}
                          className={
                            errors[`ingredient_${index}_inventory`]
                              ? "border-red-500"
                              : "border-yellow-200 focus:border-yellow-500"
                          }
                        />
                        <div className="relative">
                          {inventoryLoading && activeIngredientIndex === index && (
                            <div className="absolute left-0 top-0 text-xs text-gray-400">Searching...</div>
                          )}
                          {!inventoryLoading && activeIngredientIndex === index && inventoryOptions.length > 0 && (
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
                                    setActiveIngredientIndex(null)
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
                          min={0}
                          step={0.01}
                          value={ingredient.quantity}
                          onChange={e => setFormData(prev => ({ ...prev, ingredients: prev.ingredients.map((ing, i) => i === index ? { ...ing, quantity: parseFloat(e.target.value) } : ing) }))}
                          className={errors[`ingredient_${index}_quantity`] ? "border-red-500" : "border-yellow-200 focus:border-yellow-500"}
                        />
                        {errors[`ingredient_${index}_quantity`] && (
                          <p className="text-sm text-red-600">{errors[`ingredient_${index}_quantity`]}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Unit *</Label>
                        <Select onValueChange={(value) => updateIngredient(index, "unit", value)} value={ingredient.unit.code}>
                          <SelectTrigger className="border-yellow-200 focus:border-yellow-500">
                            <SelectValue placeholder="Select a unit" />
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
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeIngredient(index)}
                          className="border-red-500 text-red-600 hover:bg-red-50 bg-transparent"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Recipe"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}