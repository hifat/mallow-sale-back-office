"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Eye, ChefHat } from "lucide-react"
import { RecipeForm } from "@/components/recipe-form"
import { RecipeDetails } from "@/components/recipe-details"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"

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

const mockRecipes: Recipe[] = [
  {
    id: "1",
    name: "Classic Marshmallow",
    ingredients: [
      { inventoryId: "1", inventoryName: "Premium Flour", quantity: 2, unit: "kg" },
      { inventoryId: "2", inventoryName: "Organic Sugar", quantity: 1.5, unit: "kg" },
      { inventoryId: "3", inventoryName: "Vanilla Extract", quantity: 0.1, unit: "l" },
    ],
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
  },
  {
    id: "2",
    name: "Chocolate Delight",
    ingredients: [
      { inventoryId: "1", inventoryName: "Premium Flour", quantity: 1.8, unit: "kg" },
      { inventoryId: "2", inventoryName: "Organic Sugar", quantity: 1.2, unit: "kg" },
    ],
    createdAt: "2024-01-12",
    updatedAt: "2024-01-18",
  },
]

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>(mockRecipes)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState<string | null>(null)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [deletingRecipe, setDeletingRecipe] = useState<Recipe | null>(null)

  const filteredRecipes = recipes.filter((recipe) => recipe.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleSave = (data: Omit<Recipe, "id" | "createdAt" | "updatedAt">) => {
    if (editingRecipe) {
      setRecipes((prev) =>
        prev.map((recipe) =>
          recipe.id === editingRecipe.id
            ? { ...recipe, ...data, updatedAt: new Date().toISOString().split("T")[0] }
            : recipe,
        ),
      )
    } else {
      const newRecipe: Recipe = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      }
      setRecipes((prev) => [...prev, newRecipe])
    }
    setShowForm(false)
    setEditingRecipe(null)
  }

  const handleDelete = (recipe: Recipe) => {
    setRecipes((prev) => prev.filter((r) => r.id !== recipe.id))
    setDeletingRecipe(null)
  }

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recipe Management</h1>
          <p className="text-gray-600 mt-2">Create and manage your recipes with ingredient tracking</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-yellow-500 hover:bg-yellow-600 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Recipe
        </Button>
      </div>

      <Card className="border-yellow-200">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center">
            <ChefHat className="h-5 w-5 mr-2 text-yellow-600" />
            Recipes
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-yellow-200 focus:border-yellow-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecipes.map((recipe) => (
              <Card key={recipe.id} className="border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-gray-900">{recipe.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {recipe.ingredients.length} ingredients
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700">Ingredients:</p>
                    <div className="space-y-1">
                      {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
                        <p key={index} className="text-sm text-gray-600">
                          • {ingredient.inventoryName} ({ingredient.quantity} {ingredient.unit})
                        </p>
                      ))}
                      {recipe.ingredients.length > 3 && (
                        <p className="text-sm text-gray-500">+{recipe.ingredients.length - 3} more...</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-gray-500">Updated: {recipe.updatedAt}</span>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDetails(recipe.id)}
                        className="hover:bg-yellow-50"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(recipe)}
                        className="hover:bg-yellow-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingRecipe(recipe)}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRecipes.length === 0 && (
            <div className="text-center py-8">
              <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recipes found</p>
              <p className="text-sm text-gray-500">Create your first recipe to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <RecipeForm
          recipe={editingRecipe}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingRecipe(null)
          }}
        />
      )}

      {showDetails && (
        <RecipeDetails
          recipe={recipes.find((r) => r.id === showDetails)!}
          onClose={() => setShowDetails(null)}
          onEdit={(recipe) => {
            setShowDetails(null)
            handleEdit(recipe)
          }}
        />
      )}

      {deletingRecipe && (
        <DeleteConfirmDialog
          title="Delete Recipe"
          description={`Are you sure you want to delete "${deletingRecipe.name}"? This action cannot be undone.`}
          onConfirm={() => handleDelete(deletingRecipe)}
          onCancel={() => setDeletingRecipe(null)}
        />
      )}
    </div>
  )
}
