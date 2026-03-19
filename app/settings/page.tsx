"use client"

import { useEffect, useState } from "react"
import { fetchSettings, updateSettings, Settings } from "@/lib/setting-api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/hooks/use-translation"

export default function SettingsPage() {
  const { t } = useTranslation()
  const [costPercentage, setCostPercentage] = useState<number | "">("")
  const [linemanGP, setLinemanGP] = useState<number | "">("")
  const [grabGP, setGrabGP] = useState<number | "">("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchSettings()
      .then((data) => {
        setCostPercentage(data.costPercentage)
        if (data.linemanGP !== undefined) setLinemanGP(data.linemanGP)
        if (data.grabGP !== undefined) setGrabGP(data.grabGP)
      })
      .catch(() => setError(t("settings.failedLoad")))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setLoading(true)
    setSuccess(false)
    setError(null)
    try {
      await updateSettings({
        costPercentage: Number(costPercentage),
        ...(linemanGP !== "" && { linemanGP: Number(linemanGP) }),
        ...(grabGP !== "" && { grabGP: Number(grabGP) })
      })
      setSuccess(true)
    } catch (e) {
      setError(t("settings.failedSave"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t("settings.title")}</h1>
        <p className="text-gray-600 mt-2">{t("settings.description")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-yellow-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t("settings.systemSettings")}</h2>
          <div className="space-y-4">
            <label className="block text-gray-700 font-medium mb-1" htmlFor="costPercentage">
              {t("settings.defaultCostPercentage")}
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
              placeholder={t("settings.defaultCostPercentagePlaceholder")}
              disabled={loading}
            />
            
            <label className="block text-gray-700 font-medium mb-1 mt-4" htmlFor="linemanGP">
              {t("settings.linemanGP")}
            </label>
            <Input
              id="linemanGP"
              type="number"
              min={0}
              max={100}
              step={0.01}
              value={linemanGP}
              onChange={e => setLinemanGP(e.target.value === "" ? "" : parseFloat(e.target.value))}
              className="max-w-xs"
              placeholder={t("settings.gpPlaceholder")}
              disabled={loading}
            />

            <label className="block text-gray-700 font-medium mb-1 mt-4" htmlFor="grabGP">
              {t("settings.grabGP")}
            </label>
            <Input
              id="grabGP"
              type="number"
              min={0}
              max={100}
              step={0.01}
              value={grabGP}
              onChange={e => setGrabGP(e.target.value === "" ? "" : parseFloat(e.target.value))}
              className="max-w-xs"
              placeholder={t("settings.gpPlaceholder")}
              disabled={loading}
            />

            <div className="flex items-center space-x-2 mt-4">
              <Button onClick={handleSave} disabled={loading || costPercentage === ""} className="bg-yellow-500 hover:bg-yellow-600 text-white">
                {loading ? t("settings.saving") : t("settings.save")}
              </Button>
              {success && <span className="text-green-600 text-sm">{t("settings.saved")}</span>}
              {error && <span className="text-red-600 text-sm">{error}</span>}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-yellow-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t("settings.userPreferences")}</h2>
          <p className="text-gray-600">{t("settings.userPreferencesDesc")}</p>
        </div>
      </div>
    </div>
  )
}
