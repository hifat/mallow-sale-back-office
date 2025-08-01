import { ApiResponse } from './utils';

export interface Supplier {
  createdAt: string;
  id: string;
  imgUrl: string;
  name: string;
  updatedAt: string;
}

export interface SupplierPayload {
  imgUrl: string;
  name: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export async function fetchSuppliers(search = ""): Promise<ApiResponse<Supplier>> {
  const url = new URL(`${API_BASE}/suppliers`);
  if (search) url.searchParams.set("search", search);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch suppliers");
  const data = await res.json();
  return {
    items: data.items || [],
    meta: data.meta || { total: 0, page: 1, limit: 10, totalPages: 1 }
  };
}

export async function createSupplier(payload: SupplierPayload): Promise<Supplier> {
  const res = await fetch(`${API_BASE}/suppliers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create supplier");
  const data = await res.json();
  return data.item;
}

export async function fetchSupplierById(id: string): Promise<Supplier> {
  const res = await fetch(`${API_BASE}/suppliers/${id}`);
  if (!res.ok) throw new Error("Failed to fetch supplier by id");
  const data = await res.json();
  return data.item;
}

export async function updateSupplier(id: string, payload: SupplierPayload): Promise<Supplier> {
  const res = await fetch(`${API_BASE}/suppliers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update supplier");
  const data = await res.json();
  return data.item;
}

export async function deleteSupplier(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/suppliers/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete supplier");
} 