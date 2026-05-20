"use client"

import { useEffect, useState } from "react"
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
import { Plus, Trash2 } from "lucide-react"
import { fetchSuppliers, type Supplier } from "@/lib/supplier-api"
import { fetchInventories } from "@/lib/inventory-api"
import type { Inventory } from "@/types/inventory"
import type {
  Purchase,
  PurchaseOrder,
  PurchasePayload,
  PurchaseStatusCode,
  PurchaseSupplier,
  PaymentTypeCode,
} from "@/types/purchase"
import { PurchaseStatusSelect } from "@/components/purchase-status-select"
import { PurchasePaymentTypeSelect } from "@/components/purchase-payment-type-select"
import { USAGE_UNITS } from "@/types/usage-unit"
import { useTranslation } from "@/hooks/use-translation"

const emptyOrder = (): PurchaseOrder => ({
  inventoryID: "",
  inventoryName: "",
  quantity: 0,
  usageUnitCode: "",
  unitPrice: 0,
  totalPrice: 0,
  statusCode: "PENDING",
})

const emptySupplier = (): PurchaseSupplier => ({
  supplierId: "",
  supplierName: "",
  statusCode: "PENDING",
  paymentType: "CASH",
  orders: [emptyOrder()],
})

interface PurchaseFormProps {
  purchase?: Purchase | null
  onSave: (payload: PurchasePayload) => void | Promise<void>
  onCancel: () => void
  submitting?: boolean
}

export function PurchaseForm({
  purchase,
  onSave,
  onCancel,
  submitting = false,
}: PurchaseFormProps) {
  const { t } = useTranslation()
  const [suppliers, setSuppliers] = useState<PurchaseSupplier[]>(
    purchase?.suppliers?.length ? purchase.suppliers : [emptySupplier()]
  )
  const [supplierOptions, setSupplierOptions] = useState<Supplier[]>([])
  const [inventoryOptions, setInventoryOptions] = useState<Inventory[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loadingOptions, setLoadingOptions] = useState(true)

  const recalcTotal = (order: PurchaseOrder): PurchaseOrder => {
    const quantity = Number(order.quantity ?? 0)
    const unitPrice = Number(order.unitPrice ?? 0)
    return {
      ...order,
      quantity,
      unitPrice,
      totalPrice: Number((quantity * unitPrice).toFixed(2)),
    }
  }

  const formatTotalPrice = (order: PurchaseOrder) =>
    Number(order.totalPrice ?? 0).toFixed(2)

  useEffect(() => {
    if (purchase?.suppliers?.length) {
      setSuppliers(
        purchase.suppliers.map((supplier) => ({
          ...supplier,
          orders: supplier.orders.map((order) => recalcTotal(order)),
        }))
      )
    }
  }, [purchase])

  useEffect(() => {
    setLoadingOptions(true)
    Promise.all([fetchSuppliers(), fetchInventories()])
      .then(([suppliersRes, inventoriesRes]) => {
        setSupplierOptions(suppliersRes.items)
        setInventoryOptions(inventoriesRes.items)
      })
      .catch(() => {})
      .finally(() => setLoadingOptions(false))
  }, [])

  const updateSupplier = (
    index: number,
    field: keyof PurchaseSupplier,
    value: string | PaymentTypeCode | PurchaseStatusCode | PurchaseOrder[]
  ) => {
    setSuppliers((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    )
  }

  const handleSupplierSelect = (index: number, supplierId: string) => {
    const selected = supplierOptions.find((s) => s.id === supplierId)
    setSuppliers((prev) =>
      prev.map((s, i) =>
        i === index
          ? {
              ...s,
              supplierId,
              supplierName: selected?.name || "",
            }
          : s
      )
    )
  }

  const updateOrder = (
    supplierIndex: number,
    orderIndex: number,
    field: keyof PurchaseOrder,
    value: string | number | PurchaseStatusCode
  ) => {
    setSuppliers((prev) =>
      prev.map((supplier, si) => {
        if (si !== supplierIndex) return supplier
        const orders = supplier.orders.map((order, oi) => {
          if (oi !== orderIndex) return order
          const updated = { ...order, [field]: value }
          if (field === "quantity" || field === "unitPrice") {
            return recalcTotal(updated)
          }
          return updated
        })
        return { ...supplier, orders }
      })
    )
  }

  const handleInventorySelect = (
    supplierIndex: number,
    orderIndex: number,
    inventoryId: string
  ) => {
    const selected = inventoryOptions.find((inv) => inv.id === inventoryId)
    if (!selected) return
    setSuppliers((prev) =>
      prev.map((supplier, si) => {
        if (si !== supplierIndex) return supplier
        const orders = supplier.orders.map((order, oi) => {
          if (oi !== orderIndex) return order
          const unitCode =
            selected.purchaseUnit?.code?.toUpperCase() ||
            order.usageUnitCode
          const updated: PurchaseOrder = {
            ...order,
            inventoryID: selected.id,
            inventoryName: selected.name,
            usageUnitCode: unitCode,
            unitPrice: selected.purchasePrice ?? order.unitPrice,
          }
          return recalcTotal(updated)
        })
        return { ...supplier, orders }
      })
    )
  }

  const addSupplier = () => {
    setSuppliers((prev) => [...prev, emptySupplier()])
  }

  const removeSupplier = (index: number) => {
    setSuppliers((prev) => prev.filter((_, i) => i !== index))
  }

  const addOrder = (supplierIndex: number) => {
    setSuppliers((prev) =>
      prev.map((s, i) =>
        i === supplierIndex ? { ...s, orders: [...s.orders, emptyOrder()] } : s
      )
    )
  }

  const removeOrder = (supplierIndex: number, orderIndex: number) => {
    setSuppliers((prev) =>
      prev.map((s, i) => {
        if (i !== supplierIndex) return s
        const orders = s.orders.filter((_, oi) => oi !== orderIndex)
        return { ...s, orders: orders.length ? orders : [emptyOrder()] }
      })
    )
  }

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {}
    if (suppliers.length === 0) {
      nextErrors.suppliers = t("purchase.errors.suppliersRequired")
    }
    suppliers.forEach((supplier, si) => {
      if (!supplier.supplierId) {
        nextErrors[`supplier_${si}_id`] = t("purchase.errors.supplierRequired")
      }
      if (!supplier.orders.length) {
        nextErrors[`supplier_${si}_orders`] = t("purchase.errors.ordersRequired")
      }
      supplier.orders.forEach((order, oi) => {
        if (!order.inventoryID) {
          nextErrors[`order_${si}_${oi}_inventory`] = t(
            "purchase.errors.inventoryRequired"
          )
        }
        if (order.quantity <= 0) {
          nextErrors[`order_${si}_${oi}_quantity`] = t(
            "purchase.errors.quantityRequired"
          )
        }
        if (!order.usageUnitCode) {
          nextErrors[`order_${si}_${oi}_unit`] = t("purchase.errors.unitRequired")
        }
      })
    })
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const payload: PurchasePayload = {
      suppliers: suppliers.map((s) => ({
        ...s,
        orders: s.orders.map((o) => recalcTotal(o)),
      })),
    }
    onSave(payload)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24">
      {suppliers.map((supplier, supplierIndex) => (
        <Card
          key={supplierIndex}
          className="border-l-4 border-l-yellow-500 shadow-sm"
        >
          <CardHeader className="flex flex-row items-center justify-between bg-gray-50/50 py-3">
            <CardTitle className="text-lg font-semibold text-gray-800">
              {t("purchase.supplierSection", { number: supplierIndex + 1 })}
            </CardTitle>
            {suppliers.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeSupplier(supplierIndex)}
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {t("purchase.removeSupplier")}
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t("suppliers.supplier")}</Label>
                <Select
                  value={supplier.supplierId || undefined}
                  onValueChange={(v) => handleSupplierSelect(supplierIndex, v)}
                  disabled={loadingOptions}
                >
                  <SelectTrigger className="border-yellow-200 focus:border-yellow-500">
                    <SelectValue placeholder={t("purchase.selectSupplier")} />
                  </SelectTrigger>
                  <SelectContent>
                    {supplierOptions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors[`supplier_${supplierIndex}_id`] && (
                  <p className="text-sm text-red-600">
                    {errors[`supplier_${supplierIndex}_id`]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>{t("common.status")}</Label>
                <PurchaseStatusSelect
                  currentStatus={supplier.statusCode}
                  onStatusChange={(status) =>
                    updateSupplier(supplierIndex, "statusCode", status)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t("purchase.paymentType.label")}</Label>
                <PurchasePaymentTypeSelect
                  value={supplier.paymentType}
                  onChange={(paymentType) =>
                    updateSupplier(supplierIndex, "paymentType", paymentType)
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">
                  {t("purchase.orders")}
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addOrder(supplierIndex)}
                  className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t("purchase.addOrder")}
                </Button>
              </div>

              {supplier.orders.map((order, orderIndex) => (
                <div
                  key={orderIndex}
                  className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 rounded-lg bg-yellow-50/30 border border-yellow-100"
                >
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-xs text-gray-500">
                      {t("inventory.title")}
                    </Label>
                    <Select
                      value={order.inventoryID || undefined}
                      onValueChange={(v) =>
                        handleInventorySelect(supplierIndex, orderIndex, v)
                      }
                      disabled={loadingOptions}
                    >
                      <SelectTrigger className="h-9 text-sm border-gray-200 focus:border-yellow-500">
                        <SelectValue
                          placeholder={t("purchase.selectInventory")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {inventoryOptions.map((inv) => (
                          <SelectItem key={inv.id} value={inv.id}>
                            {inv.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors[`order_${supplierIndex}_${orderIndex}_inventory`] && (
                      <p className="text-xs text-red-600">
                        {errors[`order_${supplierIndex}_${orderIndex}_inventory`]}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">
                      {t("inventory.quantity")}
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      value={order.quantity || ""}
                      onChange={(e) =>
                        updateOrder(
                          supplierIndex,
                          orderIndex,
                          "quantity",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="h-9 text-sm border-gray-200 focus:border-yellow-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">
                      {t("inventory.unit")}
                    </Label>
                    <Select
                      value={order.usageUnitCode || undefined}
                      onValueChange={(v) =>
                        updateOrder(
                          supplierIndex,
                          orderIndex,
                          "usageUnitCode",
                          v.toUpperCase()
                        )
                      }
                    >
                      <SelectTrigger className="h-9 text-sm border-gray-200 focus:border-yellow-500">
                        <SelectValue placeholder={t("inventory.unit")} />
                      </SelectTrigger>
                      <SelectContent>
                        {USAGE_UNITS.map((unit) => (
                          <SelectItem
                            key={unit.code}
                            value={unit.code.toUpperCase()}
                          >
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">
                      {t("purchase.unitPrice")}
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      value={order.unitPrice || ""}
                      onChange={(e) =>
                        updateOrder(
                          supplierIndex,
                          orderIndex,
                          "unitPrice",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="h-9 text-sm border-gray-200 focus:border-yellow-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">
                      {t("purchase.totalPrice")}
                    </Label>
                    <Input
                      type="number"
                      readOnly
                      value={formatTotalPrice(order)}
                      className="h-9 text-sm bg-gray-50 border-gray-200"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs text-gray-500">
                        {t("common.status")}
                      </Label>
                      <PurchaseStatusSelect
                        currentStatus={order.statusCode}
                        onStatusChange={(status) =>
                          updateOrder(
                            supplierIndex,
                            orderIndex,
                            "statusCode",
                            status
                          )
                        }
                        className="w-full"
                      />
                    </div>
                    {supplier.orders.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOrder(supplierIndex, orderIndex)}
                        className="text-red-600 hover:bg-red-50 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addSupplier}
        className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
      >
        <Plus className="h-4 w-4 mr-2" />
        {t("purchase.addSupplier")}
      </Button>

      {errors.suppliers && (
        <p className="text-sm text-red-600">{errors.suppliers}</p>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg z-10 md:pl-64">
        <div className="max-w-5xl mx-auto flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-gray-200 hover:bg-gray-50 text-gray-600"
            disabled={submitting}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="bg-yellow-500 hover:bg-yellow-600 text-white min-w-[150px]"
            disabled={submitting}
          >
            {submitting
              ? t("common.loading")
              : purchase
                ? t("common.update")
                : t("common.save")}
          </Button>
        </div>
      </div>
    </div>
  )
}
