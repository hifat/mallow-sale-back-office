import { UsageUnit, InventoryItem } from './inventory-api'
import { Supplier } from './supplier-api'
import { ApiResponse } from './utils';

export interface Stock {
  id: string
  inventoryID: string
  inventory?: InventoryItem
  supplierID: string
  supplier?: Supplier
  purchasePrice: number
  purchaseQuantity: number
  purchaseUnit: UsageUnit
  remark?: string
  createdAt: string
  updatedAt: string
}

export interface StockPayload {
  inventoryID: string
  supplierID: string
  purchasePrice: number
  purchaseQuantity: number
  purchaseUnit: {
    code: string
  }
  remark?: string
}

export interface StockListParams {
  page?: number
  limit?: number
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
  fields?: string
}


const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"

export async function fetchStocks(params?: StockListParams): Promise<ApiResponse<Stock>> {
  const url = new URL(`${API_BASE}/stocks`)
  
  if (params) {
    if (params.page) url.searchParams.set('page', params.page.toString())
    if (params.limit) url.searchParams.set('limit', params.limit.toString())
    if (params.search) url.searchParams.set('search', params.search)
    if (params.sort) url.searchParams.set('sort', params.sort)
    if (params.order) url.searchParams.set('order', params.order)
    if (params.fields) url.searchParams.set('fields', params.fields)
  }

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error("Failed to fetch stocks")
  const data = await res.json()
  return {
    items: data.items || [],
    meta: data.meta || { total: 0 }
  }
}

export async function fetchStockById(id: string): Promise<Stock> {
  const res = await fetch(`${API_BASE}/stocks/${id}`)
  if (!res.ok) throw new Error("Failed to fetch stock by id")
  const data = await res.json()
  return data.item
}

export async function createStock(payload: StockPayload): Promise<Stock> {
  const res = await fetch(`${API_BASE}/stocks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || "Failed to create stock")
  }
  const data = await res.json()
  return data.item
}

export async function updateStock(id: string, payload: Partial<StockPayload>): Promise<Stock> {
  const res = await fetch(`${API_BASE}/stocks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || "Failed to update stock")
  }
  const data = await res.json()
  return data.item
}

export async function deleteStock(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/stocks/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || "Failed to delete stock")
  }
}
