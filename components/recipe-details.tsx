"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Edit, Calendar, ChefHat, Package } from "lucide-react"

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

interface RecipeDetailsProps {
  recipe: Recipe
  onClose: () => void
  onEdit: (recipe: Recipe) => void
}

export function RecipeDetails({ recipe, onClose, onEdit }: RecipeDetailsProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-gray-900 flex items-center">
            <ChefHat className="h-5 w-5 mr-2 text-yellow-600" />
            Recipe Details
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(recipe)}
              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{recipe.name}</h2>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {recipe.ingredients.length} ingredients
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Package className="h-5 w-5 mr-2 text-gray-600" />
              Ingredients
            </h3>
            <div className="grid gap-3">
              {recipe.ingredients.map((ingredient, index) => (
                <Card key={index} className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{ingredient.inventoryName}</p>
                        <p className="text-sm text-gray-600">Inventory ID: {ingredient.inventoryId}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {ingredient.quantity} {ingredient.unit}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created: {recipe.createdAt}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Updated: {recipe.updatedAt}</span>
                </div>
              </div>
              <span>ID: {recipe.id}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
