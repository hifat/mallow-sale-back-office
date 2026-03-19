import { authorizedFetch } from "@/lib/api-client"

export type Settings = {
  costPercentage: number
  linemanGP?: number
  grabGP?: number
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"

export async function fetchSettings(): Promise<Settings> {
  const res = await authorizedFetch(`${API_BASE}/settings`)
  if (!res.ok) throw new Error("Failed to fetch settings")
  const data = await res.json()
  return data.item || data
}

export async function updateSettings(settings: Settings): Promise<Settings> {
  const res = await authorizedFetch(`${API_BASE}/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  })
  if (!res.ok) throw new Error("Failed to update settings")
  const data = await res.json()
  return data.item || data
}