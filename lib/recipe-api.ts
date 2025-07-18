import { UsageUnit } from "./inventory-api"
import { calculateActualPrice, calculateCostPerUnit } from "@/lib/utils"

export interface InventoryItem {
  createdAt: string
  id: string
  name: string
  purchasePrice: number
  purchaseQuantity: number
  purchaseUnit: UsageUnit
  remark?: string
  updatedAt: string
  yieldPercentage: number
}

export interface RecipeIngredient {
  inventory: InventoryItem
  quantity: number
  unit: string
}

export class Recipe {
  constructor(data: any) {
    this.id = data.id
    this.name = data.name
    this.ingredients = data.ingredients
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
    this.costPercentage = data.costPercentage
    this.price = data.price
    this.otherPercentage = data.otherPercentage
    this.orderNo = data.orderNo
  }

  id: string
  name: string
  ingredients: RecipeIngredient[]
  createdAt: string
  updatedAt: string
  costPercentage?: number
  price?: number
  otherPercentage?: number
  orderNo?: number

  totalCost(): number {
    let total = 0
    for (const ingredient of this.ingredients) {
      if (
        ingredient.inventory &&
        ingredient.inventory.purchasePrice &&
        ingredient.inventory.purchaseQuantity &&
        ingredient.inventory.yieldPercentage !== undefined
      ) {
        const actualPrice = calculateActualPrice(
          ingredient.inventory.purchasePrice,
          ingredient.inventory.yieldPercentage
        )
        const costPerUnit = calculateCostPerUnit(actualPrice, ingredient.inventory.purchaseQuantity)
        total += costPerUnit * ingredient.quantity
      }
    }
    return total
  }
}

export interface RecipeIngredientPayload {
  inventoryID: string
  quantity: number
  unit: { code: string }
}

export interface RecipePayload {
  name: string
  ingredients: RecipeIngredientPayload[]
  costPercentage?: number
  price?: number
  otherPercentage?: number
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"

export async function fetchRecipes(sort: string = "order_no", order: "asc" | "desc" = "asc"): Promise<Recipe[]> {
  const res = await fetch(`${API_BASE}/recipes?sort=${sort}&order=${order}`)
  if (!res.ok) throw new Error("Failed to fetch recipes")
  const data = await res.json()
  return data.items || []
}

export async function createRecipe(recipe: RecipePayload) {
  const res = await fetch(`${API_BASE}/recipes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(recipe),
  })
  if (!res.ok) throw new Error("Failed to create recipe")
  return res.json()
}

export async function updateRecipe(id: string, recipe: RecipePayload) {
  const res = await fetch(`${API_BASE}/recipes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(recipe),
  })
  if (!res.ok) throw new Error("Failed to update recipe")
  return res.json()
}

export async function deleteRecipe(id: string) {
  const res = await fetch(`${API_BASE}/recipes/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete recipe")
  return res.json()
}

export async function fetchRecipeById(id: string): Promise<Recipe> {
  const res = await fetch(`${API_BASE}/recipes/${id}`)
  if (!res.ok) throw new Error("Failed to fetch recipe by id")
  const data = await res.json()
  return data.item || data
}

export async function updateRecipeOrderNo(orderList: { id: string; orderNo: number }[]) {
  const res = await fetch(`${API_BASE}/recipes/order-no`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderList),
  })
  if (!res.ok) throw new Error("Failed to update recipe order numbers")
  return res.json()
} 