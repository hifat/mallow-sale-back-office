"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Eye, ChefHat, GripVertical } from "lucide-react"
import { RecipeForm } from "@/components/recipe-form"
import { RecipeDetails } from "@/components/recipe-details"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { fetchRecipes, createRecipe, updateRecipe, deleteRecipe, fetchRecipeById, Recipe, RecipePayload, updateRecipeOrderNo } from "@/lib/recipe-api"
import { formatDate } from "@/lib/utils"
import { ProductCard, ProductCardActions } from "@/components/product-card";
import { ReactSortable } from "react-sortablejs"

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState<string | null>(null)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [deletingRecipe, setDeletingRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(false)
  const [detailRecipe, setDetailRecipe] = useState<Recipe | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [isOrdering, setIsOrdering] = useState(false)
  const [orderRecipes, setOrderRecipes] = useState<Recipe[]>([])

  useEffect(() => {
    setLoading(true)
    fetchRecipes()
      .then(setRecipes)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false))
  }, [])

  const startOrdering = () => {
    setOrderRecipes([...recipes])
    setIsOrdering(true)
  }
  const cancelOrdering = () => {
    setIsOrdering(false)
    setOrderRecipes([])
  }
  const saveOrdering = async () => {
    setLoading(true)
    try {
      const orderList = orderRecipes.map((r, idx) => ({ id: r.id, orderNo: idx + 1 }))
      await updateRecipeOrderNo(orderList)
      const newRecipes = await fetchRecipes()
      setRecipes(newRecipes)
      setIsOrdering(false)
      setOrderRecipes([])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filteredRecipes = recipes.filter((recipe) => recipe.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleSave = async (data: RecipePayload) => {
    setLoading(true)
    try {
      if (editingRecipe) {
        await updateRecipe(editingRecipe.id!, data)
      } else {
        await createRecipe(data)
      }
      // Always refresh the recipes list after create/update
      const newRecipes = await fetchRecipes()
      setRecipes(newRecipes)
    } catch (e) {
      console.error(e)
    } finally {
      setShowForm(false)
      setEditingRecipe(null)
      setLoading(false)
    }
  }

  const handleDelete = async (recipe: Recipe) => {
    setLoading(true)
    try {
      await deleteRecipe(recipe.id)
      setRecipes((prev) => prev.filter((r) => r.id !== recipe.id))
    } catch (e) {
      console.error(e)
    } finally {
      setDeletingRecipe(null)
      setLoading(false)
    }
  }

  const handleEdit = (recipe: Recipe) => {
    setLoading(true)
    fetchRecipeById(recipe.id)
      .then((fullRecipe) => setEditingRecipe(fullRecipe))
      .catch((e) => {
        setEditingRecipe(recipe)
        console.error(e)
      })
      .finally(() => setLoading(false))
  }

  const handleShowDetails = async (id: string) => {
    setDetailLoading(true)
    setShowDetails(id)
    try {
      const recipe = await fetchRecipeById(id)
      setDetailRecipe(recipe)
    } catch (e) {
      setDetailRecipe(null)
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <>
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
                  disabled={isOrdering}
                />
              </div>
              <div className="flex-1" />
              {!isOrdering && (
                <Button
                  variant="outline"
                  onClick={startOrdering}
                  className="ml-2 border-yellow-500 text-yellow-700 hover:bg-yellow-50 font-semibold rounded-lg transition-colors duration-200 px-6 py-2"
                  style={{ minWidth: 120, borderWidth: 2 }}
                >
                  <GripVertical className="inline-block text-yellow-500" />
                  Reorder
                </Button>
              )}
              {isOrdering && (
                <>
                  <Button variant="outline" onClick={saveOrdering} disabled={loading} className="ml-2 bg-yellow-500 text-white">
                    {loading ? "Saving..." : "Save Order"}
                  </Button>
                  <Button variant="outline" onClick={cancelOrdering} className="ml-2">
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ReactSortable
              list={isOrdering ? orderRecipes : filteredRecipes}
              setList={isOrdering ? setOrderRecipes : () => {}}
              animation={200}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              disabled={!isOrdering}
            >
              {(isOrdering ? orderRecipes : filteredRecipes).map((recipe) => (
                <div key={recipe.id} className={isOrdering ? "cursor-move opacity-90 relative" : "relative"}>
                  {isOrdering && (
                    <div className="absolute top-6 z-10 p-1">
                      <GripVertical className="text-gray-400 w-5 h-5" />
                    </div>
                  )}
                  <ProductCard
                    title={<span className="flex items-center">{recipe.name}</span>}
                    badge={
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        {recipe.ingredients.length} ingredients
                      </Badge>
                    }
                    price={typeof recipe.price === 'number' ? recipe.price : 0}
                    actions={
                      !isOrdering && (
                        <ProductCardActions>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShowDetails(recipe.id)}
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
                        </ProductCardActions>
                      )
                    }
                    className=""
                  >
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-gray-500">Updated: {formatDate(recipe.updatedAt)}</span>
                      {typeof recipe.orderNo === 'number' && (
                        <span className="text-xs text-gray-400">Order: {recipe.orderNo}</span>
                      )}
                    </div>
                  </ProductCard>
                </div>
              ))}
            </ReactSortable>

            {filteredRecipes.length === 0 && (
              <div className="text-center py-8">
                <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recipes found</p>
                <p className="text-sm text-gray-500">Create your first recipe to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {(showForm || editingRecipe) && (
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
        detailLoading ? (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded shadow text-gray-700">Loading...</div>
          </div>
        ) : detailRecipe && !editingRecipe && (
          <RecipeDetails
            recipe={detailRecipe}
            onClose={() => {
              setShowDetails(null)
              setDetailRecipe(null)
            }}
            onEdit={(recipe) => {
              setEditingRecipe(recipe)
              setShowDetails(null)
              setDetailRecipe(null)
            }}
          />
        )
      )}

      {deletingRecipe && (
        <DeleteConfirmDialog
          title="Delete Recipe"
          description={`Are you sure you want to delete "${deletingRecipe.name}"? This action cannot be undone.`}
          onConfirm={() => handleDelete(deletingRecipe)}
          onCancel={() => setDeletingRecipe(null)}
        />
      )}
    </>
  )
}
