"use client"

import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { ModalCard, ModalCardHeader } from "@/components/ui/modal-card"
import { Badge } from "@/components/ui/badge"
import { X, Edit, Calendar, ChefHat, Package, Percent, DollarSign, Tag, TrendingUp, ArrowUpRight } from "lucide-react"
import { Recipe } from "@/lib/recipe-api"
import { formatDate, calculateCostPerUnit, calculateActualPrice, getReasonablePrice, getTotalCostFromIngredients } from "@/lib/utils"
import { IngredientCard } from "@/components/ingredient-card";
import { getIngredientCostPerUnit, getIngredientCostUsed } from "@/lib/utils";

interface RecipeDetailsProps {
  recipe: Recipe
  onClose: () => void
  onEdit: (recipe: Recipe) => void
}

export function RecipeDetails({ recipe, onClose, onEdit }: RecipeDetailsProps) {
  return (
    <ModalCard maxWidth="max-w-4xl">
      <ModalCardHeader
        title={<span className="flex items-center"><ChefHat className="h-5 w-5 mr-2 text-yellow-600" />Recipe Details</span>}
        onClose={onClose}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(recipe)}
            className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        }
      />
        <CardContent className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              {recipe.name}
              {recipe.recipeType && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 border border-amber-200">
                  {recipe.recipeType.name || recipe.recipeType.code}
                </Badge>
              )}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
              {typeof recipe.costPercentage === 'number' && (
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Percent className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Cost Percentage</p>
                    <p className="text-lg font-semibold text-gray-900">{recipe.costPercentage}%</p>
                  </div>
                </div>
              )}
              {typeof recipe.otherPercentage === 'number' && (
                <div className="flex items-center space-x-3 p-3 bg-cyan-50 rounded-lg">
                  <Percent className="h-5 w-5 text-cyan-600" />
                  <div>
                    <p className="text-sm text-gray-600">Other Percentage</p>
                    <p className="text-lg font-semibold text-gray-900">{recipe.otherPercentage}%</p>
                  </div>
                </div>
              )}
              {/* (Total Cost card removed; will display near Ingredients) */}
              {/* Reasonable Price for Sale Card */}
              {(() => {
                const totalCost = getTotalCostFromIngredients(recipe.ingredients);
                const reasonablePrice = getReasonablePrice(totalCost, recipe.costPercentage);
                if (!reasonablePrice) return null;
                return (
                  <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                    <Tag className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Reasonable Price for Sale</p>
                      <p className="text-lg font-semibold text-gray-900">฿{reasonablePrice.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })()}
              {/* Selling Price Card */}
              {typeof recipe.price === 'number' && recipe.price > 0 && (
                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Selling Price</p>
                    <p className="text-lg font-semibold text-gray-900">฿{recipe.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
              )}
              {/* Total Cost with Other Percentage */}
              {(() => {
                const totalCost = getTotalCostFromIngredients(recipe.ingredients);
                const other = typeof recipe.otherPercentage === 'number' ? recipe.otherPercentage : 0;
                const totalWithOther = totalCost * (1 + other / 100);
                return (
                  <div className="flex items-center space-x-3 p-3 bg-cyan-100 rounded-lg">
                    <ArrowUpRight className="h-5 w-5 text-cyan-600" />
                    <div>
                      <p className="text-sm text-gray-600 flex items-center">Total Cost (with Other %)</p>
                      <p className="text-lg font-semibold text-gray-900">฿{totalWithOther.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                );
              })()}
              {/* Profit Card */}
              {typeof recipe.price === 'number' && recipe.price > 0 && (
                (() => {
                  const totalCost = new Recipe(recipe).totalCost();
                  const profit = recipe.price - totalCost;
                  const other = typeof recipe.otherPercentage === 'number' ? recipe.otherPercentage : 0;
                  const totalWithOther = totalCost * (1 + other / 100);
                  const profitWithOther = recipe.price - totalWithOther;
                  return (
                    <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-pink-600" />
                      <div>
                        <p className="text-sm text-gray-600">Profit</p>
                        <div className="text-lg font-semibold text-gray-900">
                          ฿{profitWithOther.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          <div className="text-sm text-gray-500">(no other %: ฿{profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</div>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Ingredients
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {recipe.ingredients.length}
                </Badge>
              </h3>
              <div className="text-right font-bold text-lg text-green-700">
                Total Cost: ฿{getTotalCostFromIngredients(recipe.ingredients).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="grid gap-3">
              {/* Calculate total cost */}
              {recipe.ingredients.map((ingredient, index) => {
                const costPerUnit = getIngredientCostPerUnit(ingredient.inventory);
                const costUsed = getIngredientCostUsed(ingredient.inventory, ingredient.quantity);
                return (
                  <IngredientCard
                    key={index}
                    name={ingredient.inventory ? ingredient.inventory.name : 'Unknown inventory'}
                    costPerUnit={costPerUnit}
                    quantity={ingredient.quantity}
                    unit={typeof ingredient.unit === 'string' ? ingredient.unit : (ingredient.unit as { code: string }).code}
                    costUsed={costUsed}
                  />
                )
              })}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created: {formatDate(recipe.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Updated: {formatDate(recipe.updatedAt)}</span>
                </div>
              </div>
              <span>ID: {recipe.id}</span>
            </div>
          </div>
        </CardContent>
    </ModalCard>
  )
}
