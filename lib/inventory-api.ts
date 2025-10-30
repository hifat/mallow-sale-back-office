import type { Inventory } from '@/types/inventory'
import { ApiResponse } from './utils';
import { UsageUnit } from '@/types/usage-unit';
import { inventorySchema } from '@/types/inventory'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"

export async function fetchInventories(params?: { fields?: string; search?: string }): Promise<ApiResponse<Inventory>> {
  let url = `${API_BASE}/inventories`;
  if (params && (params.fields || params.search)) {
    const searchParams = new URLSearchParams();
    if (params.fields) searchParams.set("fields", params.fields);
    if (params.search) searchParams.set("search", params.search);
    url += `?${searchParams.toString()}`;
  }
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch inventories")
  const data = await res.json()
  return {
    items: data.items || [],
    meta: data.meta
  }
}

export async function createInventory(item: Omit<Inventory, "id" | "createdAt" | "updatedAt">) {
  const parsed = inventorySchema.safeParse(item)
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message || "Invalid data")
  }
  const res = await fetch(`${API_BASE}/inventories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  })
  if (!res.ok) throw new Error("Failed to create inventory")
  return res.json()
}

export async function updateInventory(id: string, item: Partial<Inventory>) {
  if (item.name || item.purchaseUnit || item.purchasePrice || item.purchaseQuantity || item.yieldPercentage) {
    const base = { ...item } as any
    const parsed = inventorySchema.safeParse({ ...base, name: base.name ?? '', purchaseUnit: base.purchaseUnit ?? {code: '', name: ''}, purchasePrice: base.purchasePrice ?? 0, purchaseQuantity: base.purchaseQuantity ?? 0, yieldPercentage: base.yieldPercentage ?? 0 })
    if (!parsed.success) {
      throw new Error(parsed.error.errors[0]?.message || "Invalid data")
    }
  }
  const res = await fetch(`${API_BASE}/inventories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  })
  if (!res.ok) throw new Error("Failed to update inventory")
  return res.json()
}

export async function deleteInventory(id: string) {
  const res = await fetch(`${API_BASE}/inventories/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete inventory")
  return res.json()
} 