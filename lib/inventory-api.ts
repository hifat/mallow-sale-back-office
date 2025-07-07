export interface UsageUnit {
  code: string
  name: string
}

export interface InventoryItem {
  id: string
  name: string
  purchasePrice: number
  purchaseQuantity: number
  purchaseUnit: UsageUnit
  yieldPercentage: number
  remark?: string
  createdAt: string
  updatedAt: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"

export async function fetchInventories(): Promise<InventoryItem[]> {
  const res = await fetch(`${API_BASE}/inventories`)
  if (!res.ok) throw new Error("Failed to fetch inventories")
  const data = await res.json()
  // The swagger spec returns { items: [...] }
  return data.items || []
}

export async function createInventory(item: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">) {
  const res = await fetch(`${API_BASE}/inventories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  })
  if (!res.ok) throw new Error("Failed to create inventory")
  return res.json()
}

export async function updateInventory(id: string, item: Partial<InventoryItem>) {
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