import type { Shopping, ShoppingInput } from "@/types/shopping";
import { shoppingSchema } from "@/types/shopping";
import { ApiResponse } from "./utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
const SHOPPING_BASE = `${API_BASE}/shoppings`;

export async function fetchShoppings(): Promise<ApiResponse<Shopping>> {
  const res = await fetch(SHOPPING_BASE);
  if (!res.ok) throw new Error("Failed to fetch shoppings");
  const data = await res.json();
  return {
    items: data.items || [],
    meta: data.meta || { total: 0, page: 1, limit: 10, totalPages: 1 },
  };
}

export async function createShopping(payload: ShoppingInput) {
  const parsed = shoppingSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message || "Invalid data");
  }
  const res = await fetch(SHOPPING_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    if (res.status === 400) {
      const err = await res.json().catch(() => ({}));
      if (err?.code === "INVALID_USAGE_UNIT") {
        throw new Error("invalid usage unit");
      }
    }
    throw new Error("Failed to create shopping");
  }
  return res.json();
}

export async function updateShoppingIsComplete(id: string, isComplete: boolean) {
  const res = await fetch(`${SHOPPING_BASE}/${id}/is-complete`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isComplete }),
  });
  if (!res.ok) {
    if (res.status === 404) {
      const err = await res.json().catch(() => ({}));
      if (err?.code === "RECORD_NOT_FOUND") {
        throw new Error("record not found");
      }
    }
    throw new Error("Failed to update shopping");
  }
  return res.json();
}

export async function deleteShopping(id: string) {
  const res = await fetch(`${SHOPPING_BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) {
    if (res.status === 404) {
      const err = await res.json().catch(() => ({}));
      if (err?.code === "RECORD_NOT_FOUND") {
        throw new Error("record not found");
      }
    }
    throw new Error("Failed to delete shopping");
  }
  return res.json();
}

export function createShoppingFromInventory(inventory: { name: string; purchaseUnit?: { code?: string } }) {
  return createShopping({
    isComplete: false,
    name: inventory.name,
    purchaseQuantity: 1,
    purchaseUnit: { code: inventory?.purchaseUnit?.code || "" },
  });
}


