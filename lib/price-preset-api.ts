import type { PricePreset } from '@/types/price-preset';
import { ApiResponse } from './utils';
import { authorizedFetch } from "@/lib/api-client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export async function fetchPricePresets(params?: { search?: string, limit?: number, page?: number, sort?: string, order?: string }): Promise<ApiResponse<PricePreset>> {
  let url = `${API_BASE}/price-presets`;
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.set("search", params.search);
    if (params.limit !== undefined) searchParams.set("limit", params.limit.toString());
    if (params.page !== undefined) searchParams.set("page", params.page.toString());
    if (params.sort) searchParams.set("sort", params.sort);
    if (params.order) searchParams.set("order", params.order);
    url += `?${searchParams.toString()}`;
  }
  const res = await authorizedFetch(url);
  if (!res.ok) throw new Error("Failed to fetch price presets");
  const data = await res.json();
  return {
    items: data.items || [],
    meta: data.meta
  };
}

export async function fetchPricePresetById(id: string): Promise<PricePreset> {
  const res = await authorizedFetch(`${API_BASE}/price-presets/${id}`);
  if (!res.ok) throw new Error("Failed to fetch price preset");
  return res.json();
}
