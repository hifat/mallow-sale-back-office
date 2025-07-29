export interface Product {
  id: string
  name: string
  price: number
  // Add other product fields as needed
}

export interface PromotionType {
  id: string
  code: 'DISCOUNT' | 'PAIR' | 'FORCE_PRICE' | 'OTHER'
  name: string
}

export interface Promotion {
  id: string
  type: PromotionType
  name: string
  detail?: string
  discount?: number
  price?: number
  products: Product[]
  createdAt: string
  updatedAt: string
}

export interface PromotionPayload {
  type: {
    id: string
    code: PromotionType['code']
    name: string
  }
  name: string
  detail?: string
  discount?: number
  price?: number
  products?: string[] // Array of product IDs
}

export interface PromotionListParams {
  page?: number
  limit?: number
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
  fields?: string
}

export interface PromotionListResponse {
  items: Promotion[]
  meta: {
    total: number
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"

/**
 * Fetches a list of promotions with optional pagination and filtering
 */
export async function fetchPromotions(params?: PromotionListParams): Promise<PromotionListResponse> {
  const url = new URL(`${API_BASE}/promotions`)
  
  if (params) {
    if (params.page) url.searchParams.set('page', params.page.toString())
    if (params.limit) url.searchParams.set('limit', params.limit.toString())
    if (params.search) url.searchParams.set('search', params.search)
    if (params.sort) url.searchParams.set('sort', params.sort)
    if (params.order) url.searchParams.set('order', params.order)
    if (params.fields) url.searchParams.set('fields', params.fields)
  }

  const res = await fetch(url.toString())
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.message || "Failed to fetch promotions")
  }
  return await res.json()
}

/**
 * Fetches a single promotion by ID
 */
export async function fetchPromotionById(id: string): Promise<{ item: Promotion }> {
  const res = await fetch(`${API_BASE}/promotions/${id}`)
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.message || "Failed to fetch promotion")
  }
  return await res.json()
}

/**
 * Creates a new promotion
 */
export async function createPromotion(payload: PromotionPayload): Promise<{ item: Promotion }> {
  const res = await fetch(`${API_BASE}/promotions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.message || "Failed to create promotion")
  }
  
  return await res.json()
}

/**
 * Updates an existing promotion
 */
export async function updatePromotion(
  id: string, 
  payload: Partial<PromotionPayload>
): Promise<{ item: Promotion }> {
  const res = await fetch(`${API_BASE}/promotions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.message || "Failed to update promotion")
  }
  
  return await res.json()
}

/**
 * Deletes a promotion
 */
export async function deletePromotion(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/promotions/${id}`, {
    method: 'DELETE',
  })
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.message || "Failed to delete promotion")
  }
}

/**
 * Fetches available promotion types
 */
export async function fetchPromotionTypes(): Promise<PromotionType[]> {
  // This would typically come from an API endpoint, but for now we'll return static data
  return [
    { id: 'type_1', code: 'DISCOUNT', name: 'Discount' },
    { id: 'type_2', code: 'PAIR', name: 'Pair Promotion' },
    { id: 'type_3', code: 'FORCE_PRICE', name: 'Fixed Price' },
    { id: 'type_4', code: 'OTHER', name: 'Other' },
  ]
}
