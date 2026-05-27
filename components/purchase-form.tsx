"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Minus, Plus } from "lucide-react"
import type {
  PaymentTypeCode,
  Purchase,
  PurchaseOrder,
  PurchasePayload,
  PurchaseStatusCode,
  PurchaseSupplier,
  SupplierInventoryGroup,
} from "@/types/purchase"
import { fetchSupplierInventories } from "@/lib/purchase-api"
import { USAGE_UNITS } from "@/types/usage-unit"
import { useTranslation } from "@/hooks/use-translation"

interface PurchaseFormProps {
  purchase?: Purchase | null
  onSave: (payload: PurchasePayload) => void | Promise<void>
  onCancel: () => void
  submitting?: boolean
}

type OrderSelection = {
  quantity: number
  usageUnitCode: string
  unitPrice: number
  statusCode: PurchaseStatusCode
}

const keyFor = (supplierId: string, inventoryId: string) =>
  `${supplierId}:${inventoryId}`

const recalcTotal = (quantity: number, unitPrice: number) =>
  Number((quantity * unitPrice).toFixed(2))

export function PurchaseForm({
  purchase,
  onSave,
  onCancel,
  submitting = false,
}: PurchaseFormProps) {
  const { t } = useTranslation()
  const [groups, setGroups] = useState<SupplierInventoryGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selections, setSelections] = useState<Record<string, OrderSelection>>({})

  const supplierDefaults = useMemo(() => {
    const defaults = new Map<
      string,
      { statusCode: PurchaseStatusCode; paymentType: PaymentTypeCode; supplierName: string }
    >()
    for (const supplier of purchase?.suppliers || []) {
      defaults.set(supplier.supplierId, {
        statusCode: supplier.statusCode,
        paymentType: supplier.paymentType,
        supplierName: supplier.supplierName,
      })
    }
    return defaults
  }, [purchase])

  useEffect(() => {
    const initialSelections: Record<string, OrderSelection> = {}
    for (const supplier of purchase?.suppliers || []) {
      for (const order of supplier.orders) {
        initialSelections[keyFor(supplier.supplierId, order.inventoryID)] = {
          quantity: Number(order.quantity || 0),
          usageUnitCode: order.usageUnitCode || "",
          unitPrice: Number(order.unitPrice || 0),
          statusCode: order.statusCode || "PENDING",
        }
      }
    }
    setSelections(initialSelections)
  }, [purchase])

  useEffect(() => {
    setLoading(true)
    fetchSupplierInventories()
      .then((res) => setGroups(res.items))
      .catch(() => setGroups([]))
      .finally(() => setLoading(false))
  }, [])

  const setOrderSelection = (
    supplierId: string,
    inventoryId: string,
    updater: (current: OrderSelection) => OrderSelection
  ) => {
    const key = keyFor(supplierId, inventoryId)
    setSelections((prev) => {
      const current =
        prev[key] ||
        ({
          quantity: 0,
          usageUnitCode: "",
          unitPrice: 0,
          statusCode: "PENDING",
        } as OrderSelection)
      return { ...prev, [key]: updater(current) }
    })
  }

  const getOrderSelection = (
    supplierId: string,
    inventoryId: string,
    fallbackUnitCode: string,
    fallbackPrice: number
  ): OrderSelection => {
    return (
      selections[keyFor(supplierId, inventoryId)] || {
        quantity: 0,
        usageUnitCode: fallbackUnitCode?.toUpperCase() || "",
        unitPrice: fallbackPrice || 0,
        statusCode: "PENDING",
      }
    )
  }

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {}
    let selectedCount = 0

    for (const group of groups) {
      for (const inventory of group.inventories) {
        const current = getOrderSelection(
          group.supplier.id,
          inventory.id,
          inventory.purchaseUnit?.code || "",
          Number(inventory.purchasePrice || 0)
        )
        if (current.quantity > 0) {
          selectedCount += 1
          if (!current.usageUnitCode) {
            nextErrors[keyFor(group.supplier.id, inventory.id)] = t("inventory.unit")
          }
        }
      }
    }

    if (selectedCount === 0) {
      nextErrors.form = "Please select at least one inventory item."
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    const supplierMap = new Map<string, PurchaseSupplier>()

    for (const group of groups) {
      const defaults = supplierDefaults.get(group.supplier.id)
      for (const inventory of group.inventories) {
        const selected = getOrderSelection(
          group.supplier.id,
          inventory.id,
          inventory.purchaseUnit?.code || "",
          Number(inventory.purchasePrice || 0)
        )
        if (selected.quantity <= 0) continue

        const order: PurchaseOrder = {
          inventoryID: inventory.id,
          inventoryName: inventory.name,
          quantity: selected.quantity,
          usageUnitCode: selected.usageUnitCode,
          unitPrice: selected.unitPrice || Number(inventory.purchasePrice || 0),
          totalPrice: recalcTotal(
            selected.quantity,
            selected.unitPrice || Number(inventory.purchasePrice || 0)
          ),
          statusCode: selected.statusCode || "PENDING",
        }

        if (!supplierMap.has(group.supplier.id)) {
          supplierMap.set(group.supplier.id, {
            supplierId: group.supplier.id,
            supplierName: defaults?.supplierName || group.supplier.name,
            statusCode: defaults?.statusCode || "PENDING",
            paymentType: defaults?.paymentType || "CASH",
            orders: [],
          })
        }
        supplierMap.get(group.supplier.id)!.orders.push(order)
      }
    }

    onSave({ suppliers: Array.from(supplierMap.values()) })
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {groups.map((group) => (
        <Card key={group.supplier.id} className="border-l-4 border-l-yellow-500 shadow-sm">
          <CardHeader className="py-3 bg-gray-50/50">
            <CardTitle className="text-lg font-semibold text-gray-800">
              {group.supplier.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {group.inventories.map((inventory) => {
              const selection = getOrderSelection(
                group.supplier.id,
                inventory.id,
                inventory.purchaseUnit?.code || "",
                Number(inventory.purchasePrice || 0)
              )
              const rowError = errors[keyFor(group.supplier.id, inventory.id)]
              return (
                <div
                  key={inventory.id}
                  className="p-3 rounded-lg border border-yellow-100 bg-yellow-50/30"
                >
                  <div className="space-y-3 md:space-y-0 md:flex md:items-end md:gap-3">
                    <div className="space-y-1 md:flex-1">
                      <p className="text-sm font-medium text-gray-900">{inventory.name}</p>
                    </div>

                    <div className="flex items-end gap-2 md:min-w-[360px]">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            className="h-9 w-9 shrink-0"
                            onClick={() =>
                              setOrderSelection(group.supplier.id, inventory.id, (current) => ({
                                ...current,
                                quantity: Math.max(0, Number((current.quantity - 1).toFixed(2))),
                                usageUnitCode:
                                  current.usageUnitCode ||
                                  inventory.purchaseUnit?.code?.toUpperCase() ||
                                  "",
                                unitPrice: current.unitPrice || Number(inventory.purchasePrice || 0),
                              }))
                            }
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            min={0}
                            step="any"
                            value={selection.quantity}
                            onChange={(e) =>
                              setOrderSelection(group.supplier.id, inventory.id, (current) => ({
                                ...current,
                                quantity: Math.max(0, parseFloat(e.target.value) || 0),
                                usageUnitCode:
                                  current.usageUnitCode ||
                                  inventory.purchaseUnit?.code?.toUpperCase() ||
                                  "",
                                unitPrice: current.unitPrice || Number(inventory.purchasePrice || 0),
                              }))
                            }
                            className="h-9 text-sm border-gray-200 focus:border-yellow-500 min-w-0"
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            className="h-9 w-9 shrink-0"
                            onClick={() =>
                              setOrderSelection(group.supplier.id, inventory.id, (current) => ({
                                ...current,
                                quantity: Number((current.quantity + 1).toFixed(2)),
                                usageUnitCode:
                                  current.usageUnitCode ||
                                  inventory.purchaseUnit?.code?.toUpperCase() ||
                                  "",
                                unitPrice: current.unitPrice || Number(inventory.purchasePrice || 0),
                              }))
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1 w-[120px] sm:w-[150px] shrink-0">
                        <Select
                          value={selection.usageUnitCode || undefined}
                          onValueChange={(value) =>
                            setOrderSelection(group.supplier.id, inventory.id, (current) => ({
                              ...current,
                              usageUnitCode: value.toUpperCase(),
                              unitPrice: current.unitPrice || Number(inventory.purchasePrice || 0),
                            }))
                          }
                        >
                          <SelectTrigger className="h-9 text-sm border-gray-200 focus:border-yellow-500">
                            <SelectValue placeholder={t("inventory.unit")} />
                          </SelectTrigger>
                          <SelectContent>
                            {USAGE_UNITS.map((unit) => (
                              <SelectItem key={unit.code} value={unit.code.toUpperCase()}>
                                {unit.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  {rowError && <p className="text-xs text-red-600">{rowError}</p>}
                </div>
              )
            })}
          </CardContent>
        </Card>
      ))}

      {loading && <p className="text-sm text-gray-500">{t("common.loading")}</p>}
      {!loading && groups.length === 0 && (
        <p className="text-sm text-gray-500">No supplier inventory data found.</p>
      )}
      {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          {t("common.cancel")}
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          className="bg-yellow-500 hover:bg-yellow-600 text-white min-w-[120px]"
          disabled={submitting || loading}
        >
          {submitting ? t("common.loading") : "Submit"}
        </Button>
      </div>
    </div>
  )
}
