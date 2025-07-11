import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import dayjs from "dayjs"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

  export function formatDate(date: string | Date, format = "YYYY-MM-DD HH:mm"): string {
    return dayjs(date).format(format)
  }

export function calculateActualPrice(purchasePrice: number, yieldPercentage: number): number {
  return purchasePrice + (purchasePrice * (100 - yieldPercentage)) / 100
}

export function calculateCostPerUnit(purchasePrice: number, purchaseQuantity: number): number {
  return purchasePrice / purchaseQuantity
}

export function calculateReasonablePriceForSale(totalCost: number, costPercentage?: number): number | null {
  if (typeof costPercentage !== 'number' || costPercentage <= 0) return null;
  return totalCost / (costPercentage / 100);
}

/**
 * Calculate the reasonable price for sale given total cost and cost percentage.
 * Returns 0 if costPercentage is not valid.
 */
export function getReasonablePrice(totalCost: number, costPercentage?: number | null): number {
  if (!costPercentage || isNaN(costPercentage) || costPercentage <= 0) return 0;
  const price = totalCost / (costPercentage / 100);
  if (!isFinite(price) || isNaN(price)) return 0;
  return price;
}

/**
 * Calculate the total cost from an array of ingredients (with inventory and quantity).
 */
export function getTotalCostFromIngredients(ingredients: Array<{inventory: any, quantity: number}>): number {
  let totalCost = 0;
  for (const ingredient of ingredients) {
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
  return totalCost;
}

/**
 * Calculate cost per unit for an ingredient, factoring in yield percentage.
 */
export function getIngredientCostPerUnit(inventory: any): number {
  if (!inventory || !inventory.purchasePrice || !inventory.purchaseQuantity || inventory.yieldPercentage === undefined) return 0;
  const actualPrice = calculateActualPrice(inventory.purchasePrice, inventory.yieldPercentage);
  return calculateCostPerUnit(actualPrice, inventory.purchaseQuantity);
}

/**
 * Calculate cost used for an ingredient (cost per unit * quantity).
 */
export function getIngredientCostUsed(inventory: any, quantity: number): number {
  const costPerUnit = getIngredientCostPerUnit(inventory);
  return costPerUnit * quantity;
}
