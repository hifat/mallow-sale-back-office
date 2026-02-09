import { ShoppingUsageUnit, ShoppingUsageUnitInput, ShoppingUsageUnitResponse } from "@/types/shopping-usage-unit";
import { shoppingUsageUnitSchema } from "@/types/shopping-usage-unit";
import { authorizedFetch } from "@/lib/api-client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
const USAGE_UNIT_BASE = `${API_BASE}/shopping-usage-units`;

export async function fetchShoppingUsageUnits(): Promise<ShoppingUsageUnitResponse> {
  const res = await authorizedFetch(USAGE_UNIT_BASE);
  if (!res.ok) throw new Error("Failed to fetch shopping usage units");
  const data = await res.json();
  return {
    items: data.items || [],
    meta: data.meta || { total: 0 },
  };
}

export async function getShoppingUsageUnit(id: string): Promise<ShoppingUsageUnit> {
  const res = await authorizedFetch(`${USAGE_UNIT_BASE}/${id}`);
  if (!res.ok) {
    if (res.status === 404) {
       throw new Error("record not found");
    }
    throw new Error("Failed to fetch shopping usage unit");
  }
  const data = await res.json();
  return data.item;
}

export async function createShoppingUsageUnit(payload: ShoppingUsageUnitInput) {
  const parsed = shoppingUsageUnitSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message || "Invalid data");
  }
  const res = await authorizedFetch(USAGE_UNIT_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    if (res.status === 400) {
      const err = await res.json().catch(() => ({}));
      if (err?.code === "DUPLICATED_SHOPPING_USAGE_UNIT") {
        throw new Error("duplicated shopping usage unit");
      }
    }
    throw new Error("Failed to create shopping usage unit");
  }
  return res.json();
}

export async function updateShoppingUsageUnit(id: string, payload: ShoppingUsageUnitInput) {
  const parsed = shoppingUsageUnitSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message || "Invalid data");
  }
  const res = await authorizedFetch(`${USAGE_UNIT_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    if (res.status === 400) {
        const err = await res.json().catch(() => ({}));
        if (err?.code === "DUPLICATED_SHOPPING_USAGE_UNIT") {
          throw new Error("duplicated shopping usage unit");
        }
    }
    if (res.status === 404) {
      throw new Error("record not found");
    }
    throw new Error("Failed to update shopping usage unit");
  }
  return res.json();
}

export async function deleteShoppingUsageUnit(id: string) {
  const res = await authorizedFetch(`${USAGE_UNIT_BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) {
     if (res.status === 404) {
      throw new Error("record not found");
    }
    throw new Error("Failed to delete shopping usage unit");
  }
  return res.json();
}
