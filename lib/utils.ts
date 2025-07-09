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
