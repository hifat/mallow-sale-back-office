import type {
  GroupBySupplierResponse,
  PaymentTypeCode,
  Purchase,
  PurchaseListItem,
  PurchaseListParams,
  PurchaseOrder,
  PurchasePayload,
  PurchaseStatusCode,
  PurchaseSupplier,
} from "@/types/purchase"
import { ApiResponse } from "./utils"
import { authorizedFetch } from "@/lib/api-client"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"
const PURCHASES_BASE = `${API_BASE}/purchases`

function calcTotalPrice(quantity: number, unitPrice: number, totalPrice?: number): number {
  if (totalPrice != null && !Number.isNaN(Number(totalPrice))) {
    return Number(totalPrice)
  }
  return Number((quantity * unitPrice).toFixed(2))
}

function normalizeOrder(raw: Record<string, unknown>): PurchaseOrder {
  const quantity = Number(raw.quantity ?? 0)
  const unitPrice = Number(raw.unitPrice ?? 0)
  return {
    inventoryID: String(raw.inventoryID ?? raw.inventoryId ?? ""),
    inventoryName: String(raw.inventoryName ?? ""),
    quantity,
    usageUnitCode: String(raw.usageUnitCode ?? ""),
    unitPrice,
    totalPrice: calcTotalPrice(
      quantity,
      unitPrice,
      raw.totalPrice as number | undefined
    ),
    statusCode: (raw.statusCode as PurchaseStatusCode) ?? "PENDING",
  }
}

function normalizeSupplier(raw: Record<string, unknown>): PurchaseSupplier {
  const orders = Array.isArray(raw.orders) ? raw.orders : []
  return {
    supplierId: String(raw.supplierId ?? raw.supplierID ?? ""),
    supplierName: String(raw.supplierName ?? ""),
    statusCode: (raw.statusCode as PurchaseStatusCode) ?? "PENDING",
    paymentType: (raw.paymentType as PaymentTypeCode) ?? "CASH",
    orders: orders.map((o) => normalizeOrder(o as Record<string, unknown>)),
  }
}

export function normalizePurchase(raw: Record<string, unknown>): Purchase {
  const suppliers = Array.isArray(raw.suppliers) ? raw.suppliers : []
  return {
    id: String(raw.id ?? ""),
    purchaseStatusCode:
      (raw.purchaseStatusCode as PurchaseStatusCode) ?? "PENDING",
    suppliers: suppliers.map((s) =>
      normalizeSupplier(s as Record<string, unknown>)
    ),
    createdAt: String(raw.createdAt ?? ""),
    updatedAt: String(raw.updatedAt ?? ""),
  }
}

async function parseError(res: Response, fallback: string): Promise<never> {
  const err = await res.json().catch(() => ({}))
  throw new Error(err?.message || fallback)
}

export async function fetchPurchases(
  params?: PurchaseListParams
): Promise<ApiResponse<PurchaseListItem>> {
  const url = new URL(PURCHASES_BASE)
  if (params) {
    if (params.page) url.searchParams.set("page", params.page.toString())
    if (params.limit) url.searchParams.set("limit", params.limit.toString())
    if (params.search) url.searchParams.set("search", params.search)
    if (params.sort) url.searchParams.set("sort", params.sort)
    if (params.order) url.searchParams.set("order", params.order)
  }

  const res = await authorizedFetch(url.toString())
  if (!res.ok) throw new Error("Failed to fetch purchases")
  const data = await res.json()
  return {
    items: data.items || [],
    meta: data.meta || { total: 0, page: 1, limit: 10, totalPages: 1 },
  }
}

export async function fetchPurchaseById(id: string): Promise<Purchase> {
  const res = await authorizedFetch(`${PURCHASES_BASE}/${id}`)
  if (!res.ok) {
    if (res.status === 404) await parseError(res, "Purchase not found")
    throw new Error("Failed to fetch purchase")
  }
  const data = await res.json()
  return normalizePurchase(data.item ?? {})
}

export async function createPurchase(payload: PurchasePayload): Promise<Purchase> {
  const res = await authorizedFetch(PURCHASES_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) await parseError(res, "Failed to create purchase")
  const data = await res.json()
  return normalizePurchase(data.item ?? {})
}

export async function updatePurchase(
  id: string,
  payload: PurchasePayload
): Promise<Purchase> {
  const res = await authorizedFetch(`${PURCHASES_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) await parseError(res, "Failed to update purchase")
  const data = await res.json()
  return normalizePurchase(data.item ?? {})
}

export async function deletePurchase(id: string): Promise<void> {
  const res = await authorizedFetch(`${PURCHASES_BASE}/${id}`, { method: "DELETE" })
  if (!res.ok) await parseError(res, "Failed to delete purchase")
}

export async function fetchSupplierInventories(): Promise<GroupBySupplierResponse> {
  const res = await authorizedFetch(`${API_BASE}/supplier-inventories`)
  if (!res.ok) throw new Error("Failed to fetch supplier inventories")
  const data = await res.json()
  return {
    items: data.items || [],
    meta: data.meta || { total: 0 },
  }
}
