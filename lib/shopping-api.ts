import type { Shopping, ShoppingInput, ReceiptResponse } from "@/types/shopping";
import { shoppingSchema } from "@/types/shopping";
import { ApiResponse } from "./utils";
import { authorizedFetch } from "@/lib/api-client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
const SHOPPING_BASE = `${API_BASE}/shoppings`;

export async function fetchShoppings(): Promise<ApiResponse<Shopping>> {
  const res = await authorizedFetch(SHOPPING_BASE);
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
  const res = await authorizedFetch(SHOPPING_BASE, {
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
  const res = await authorizedFetch(`${SHOPPING_BASE}/${id}/is-complete`, {
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
  const res = await authorizedFetch(`${SHOPPING_BASE}/${id}`, { method: "DELETE" });
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

export async function readReceipt(imageFile: File): Promise<ReceiptResponse> {
  const formData = new FormData();
  formData.append("image", imageFile);

  const res = await authorizedFetch(`${SHOPPING_BASE}/read-receipt`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    if (res.status === 400) {
      const err = await res.json().catch(() => ({}));
      if (err?.code === "MAX_FILE_SIZE") {
        throw new Error("max file size");
      }
      if (err?.code === "NOT_ALLOWED_MIME_TYPE") {
        throw new Error("not allowed mime type");
      }
      throw new Error(err?.message || "Failed to read receipt");
    }
    if (res.status === 500) {
      const err = await res.json().catch(() => ({}));
      if (err?.code === "INTERNAL_SERVER_ERROR") {
        throw new Error("internal server error");
      }
    }
    throw new Error("Failed to read receipt");
  }

  const data = await res.json();
  return {
    items: data.items || [],
    meta: data.meta || { total: 0 },
  };
}


