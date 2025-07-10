"use client"

import { useEffect, useState } from "react"
import { fetchSettings, updateSettings, Settings } from "@/lib/setting-api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  const [costPercentage, setCostPercentage] = useState<number | "">("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchSettings()
      .then((data) => setCostPercentage(data.costPercentage))
      .catch(() => setError("Failed to load settings"))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setLoading(true)
    setSuccess(false)
    setError(null)
    try {
      await updateSettings({ costPercentage: Number(costPercentage) })
      setSuccess(true)
    } catch (e) {
      setError("Failed to save settings")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Configure your Mallow Sale back office settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-yellow-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Settings</h2>
          <div className="space-y-4">
            <label className="block text-gray-700 font-medium mb-1" htmlFor="costPercentage">
              Default Cost Percentage (%)
            </label>
            <Input
              id="costPercentage"
              type="number"
              min={0}
              max={100}
              step={0.01}
              value={costPercentage}
              onChange={e => setCostPercentage(e.target.value === "" ? "" : parseFloat(e.target.value))}
              className="max-w-xs"
              placeholder="Enter default cost percentage"
              disabled={loading}
            />
            <div className="flex items-center space-x-2 mt-2">
              <Button onClick={handleSave} disabled={loading || costPercentage === ""} className="bg-yellow-500 hover:bg-yellow-600 text-white">
                {loading ? "Saving..." : "Save"}
              </Button>
              {success && <span className="text-green-600 text-sm">Saved!</span>}
              {error && <span className="text-red-600 text-sm">{error}</span>}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-yellow-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">User Preferences</h2>
          <p className="text-gray-600">User preference settings will be available here.</p>
        </div>
      </div>
    </div>
  )
}
