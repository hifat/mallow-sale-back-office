"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/hooks/use-translation"
import { ChevronLeft, Square } from "lucide-react"
import type { ShoppingInventorySupplier, ShoppingInventoryItem, ShoppingOrderInventory } from "@/types/shopping"
import { getShoppingInventories, createShoppingBatch } from "@/lib/shopping-api"
import { CenteredEmptyState } from "@/components/ui/CenteredEmptyState"
import { USAGE_UNITS } from "@/types/usage-unit"

interface SelectedItem {
    quantity: number
    unit: string
}

export default function CreateShoppingPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { t } = useTranslation()
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [suppliers, setSuppliers] = useState<ShoppingInventorySupplier[]>([])
    const [selectedItems, setSelectedItems] = useState<Record<string, SelectedItem>>({})

    useEffect(() => {
        setLoading(true)
        getShoppingInventories()
            .then((res) => {
                setSuppliers(res.items)
            })
            .catch(() => toast({ title: t("common.error"), description: t("shopping.toast.fetchError") }))
            .finally(() => setLoading(false))
    }, [toast, t])

    // Helper function to create composite key for supplier+inventory
    const getItemKey = (supplierId: string, inventoryId: string) => `${supplierId}:${inventoryId}`

    const handleSupplierCheck = (supplierId: string, checked: boolean) => {
        const supplier = suppliers.find(s => s.supplierID === supplierId)
        if (!supplier) return

        setSelectedItems(prev => {
            const next = { ...prev }
            if (checked) {
                supplier.inventories.forEach(inv => {
                    const key = getItemKey(supplierId, inv.inventoryID)
                    if (!next[key]) {
                        next[key] = { quantity: 0, unit: inv.usageUnitCode }
                    }
                })
            } else {
                supplier.inventories.forEach(inv => {
                    const key = getItemKey(supplierId, inv.inventoryID)
                    delete next[key]
                })
            }
            return next
        })
    }

    const handleInventoryCheck = (supplierId: string, inventoryId: string, checked: boolean) => {
        const key = getItemKey(supplierId, inventoryId)
        setSelectedItems(prev => {
            const next = { ...prev }
            if (checked) {
                const inventory = suppliers.find(s => s.supplierID === supplierId)?.inventories.find(inv => inv.inventoryID === inventoryId)
                next[key] = { quantity: 0, unit: inventory?.usageUnitCode || "" }
            } else {
                delete next[key]
            }
            return next
        })
    }

    const updateItem = (key: string, field: "quantity" | "unit", value: string | number) => {
        setSelectedItems(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: value
            }
        }))
    }

    const handleReset = () => {
        setSelectedItems({})
    }

    const handleCreateOrder = async () => {
        // Group selected items by supplier
        const ordersBySupplier: Record<string, ShoppingOrderInventory[]> = {}

        let orderNo = 0
        for (const supplier of suppliers) {
            const supplierInventories = supplier.inventories.filter(inv => selectedItems[getItemKey(supplier.supplierID, inv.inventoryID)])
            if (supplierInventories.length > 0) {
                ordersBySupplier[supplier.supplierID] = supplierInventories.map(inv => {
                    const key = getItemKey(supplier.supplierID, inv.inventoryID)
                    orderNo++
                    return {
                        inventoryID: inv.inventoryID,
                        orderNo,
                        purchaseQuantity: selectedItems[key].quantity,
                        purchaseUnit: { code: selectedItems[key].unit }
                    }
                })
            }
        }

        setSubmitting(true)
        try {
            // Build batch payload array
            const batchPayload = Object.entries(ordersBySupplier).map(([supplierID, inventories]) => ({
                inventories,
                supplierID
            }))

            await createShoppingBatch(batchPayload)

            toast({ title: t("common.success"), description: t("shopping.toast.createSuccess") })
            handleReset()
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: t("common.error"),
                description: error.message || t("shopping.toast.createError")
            })
        } finally {
            setSubmitting(false)
        }
    }

    const isSupplierChecked = (supplier: ShoppingInventorySupplier) => {
        return supplier.inventories.every(inv => !!selectedItems[getItemKey(supplier.supplierID, inv.inventoryID)])
    }

    return (
        <div className="space-y-2 max-w-5xl mx-auto pb-20">
            <div>
                <Button variant="ghost" onClick={() => router.back()} className="hover:bg-gray-100">
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    {t("common.back")}
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">{t("shopping.createTitle")}</h1>
            </div>

            {!loading && suppliers.length === 0 ? (
                <CenteredEmptyState
                    icon={<Square className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
                    title={t("shopping.emptyTitle")}
                    subtitle={t("shopping.emptySubtitle")}
                />
            ) : suppliers.map((supplier) => (
                <Card key={supplier.id} className="border-l-4 border-l-yellow-500 shadow-sm">
                    <CardHeader className="p-2 pt-3 bg-gray-50/50">
                        <div className="flex items-center space-x-3">
                            <Checkbox
                                id={`supplier-${supplier.supplierID}`}
                                checked={isSupplierChecked(supplier)}
                                onCheckedChange={(checked) => handleSupplierCheck(supplier.supplierID, checked as boolean)}
                                className="data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                            />
                            <CardTitle className="text-lg font-semibold text-gray-800 cursor-pointer" onClick={() => handleSupplierCheck(supplier.supplierID, !isSupplierChecked(supplier))}>
                                {supplier.supplierName}
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="grid">
                        {supplier.inventories.map((inventory) => {
                            const itemKey = getItemKey(supplier.supplierID, inventory.inventoryID)
                            const isSelected = !!selectedItems[itemKey]
                            return (
                                <div key={itemKey} className={`flex items-start space-x-4 p-3 rounded-lg transition-colors ${isSelected ? "bg-yellow-50/50" : "hover:bg-gray-50"}`}>
                                    <Checkbox
                                        id={`inv-${itemKey}`}
                                        checked={isSelected}
                                        onCheckedChange={(checked) => handleInventoryCheck(supplier.supplierID, inventory.inventoryID, checked as boolean)}
                                        className="data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                                    />
                                    <div className="flex-1 space-y-3">
                                        <label
                                            htmlFor={`inv-${itemKey}`}
                                            className="text-sm font-medium text-gray-900 block cursor-pointer"
                                        >
                                            {inventory.inventoryName}
                                        </label>

                                        {isSelected && (
                                            <div className="flex space-x-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                                <div className="flex-1 max-w-[150px]">
                                                    <Input
                                                        type="number"
                                                        placeholder={t("inventory.quantity")} // Reusing existing translation
                                                        value={selectedItems[itemKey]?.quantity || ""}
                                                        onChange={(e) => updateItem(itemKey, "quantity", parseFloat(e.target.value) || 0)}
                                                        className="h-9 text-sm border-gray-200 focus:border-yellow-500 focus:ring-yellow-500"
                                                    />
                                                </div>
                                                <div className="flex-1 max-w-[150px]">
                                                    <Select
                                                        value={selectedItems[itemKey]?.unit || ""}
                                                        onValueChange={(value) => updateItem(itemKey, "unit", value)}
                                                    >
                                                        <SelectTrigger className="h-9 text-sm border-gray-200 focus:border-yellow-500 focus:ring-yellow-500">
                                                            <SelectValue placeholder={t("inventory.unit")} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {USAGE_UNITS.map((unit) => (
                                                                <SelectItem key={unit.code} value={unit.code}>
                                                                    {unit.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            ))}

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg z-10 md:pl-64"> {/* Assuming sidebar width */}
                <div className="max-w-5xl mx-auto flex justify-end space-x-3">
                    <Button
                        variant="outline"
                        onClick={handleReset}
                        className="border-gray-200 hover:bg-gray-50 text-gray-600"
                    >
                        {t("common.reset")}
                    </Button>
                    <Button
                        onClick={handleCreateOrder}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white min-w-[150px]"
                        disabled={Object.keys(selectedItems).length === 0 || submitting}
                    >
                        {submitting ? t("common.loading") : t("shopping.createOrder")}
                    </Button>
                </div>
            </div>
        </div>
    )
}
