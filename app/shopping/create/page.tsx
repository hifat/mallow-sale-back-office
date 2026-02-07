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
import type { ShoppingInventorySupplier, ShoppingInventoryItem } from "@/types/shopping"
import { getShoppingInventories } from "@/lib/shopping-api"
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

    const handleSupplierCheck = (supplierId: string, checked: boolean) => {
        const supplier = suppliers.find(s => s.supplierID === supplierId)
        if (!supplier) return

        setSelectedItems(prev => {
            const next = { ...prev }
            if (checked) {
                supplier.inventories.forEach(inv => {
                    if (!next[inv.inventoryID]) {
                        next[inv.inventoryID] = { quantity: 0, unit: inv.usageUnitCode }
                    }
                })
            } else {
                supplier.inventories.forEach(inv => {
                    delete next[inv.inventoryID]
                })
            }
            return next
        })
    }

    const handleInventoryCheck = (inventoryId: string, checked: boolean) => {
        setSelectedItems(prev => {
            const next = { ...prev }
            if (checked) {
                const inventory = suppliers.flatMap(s => s.inventories).find(inv => inv.inventoryID === inventoryId)
                next[inventoryId] = { quantity: 0, unit: inventory?.usageUnitCode || "" }
            } else {
                delete next[inventoryId]
            }
            return next
        })
    }

    const updateItem = (inventoryId: string, field: "quantity" | "unit", value: string | number) => {
        setSelectedItems(prev => ({
            ...prev,
            [inventoryId]: {
                ...prev[inventoryId],
                [field]: value
            }
        }))
    }

    const handleReset = () => {
        setSelectedItems({})
    }

    const handleCreateOrder = () => {
        // Placeholder for create order logic
        console.log("Create Order:", selectedItems)
        toast({ title: "Info", description: "Create Order logic pending implementation" })
    }

    const isSupplierChecked = (supplier: ShoppingInventorySupplier) => {
        return supplier.inventories.every(inv => !!selectedItems[inv.inventoryID])
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
                            const isSelected = !!selectedItems[inventory.inventoryID]
                            return (
                                <div key={inventory.inventoryID} className={`flex items-start space-x-4 p-3 rounded-lg transition-colors ${isSelected ? "bg-yellow-50/50" : "hover:bg-gray-50"}`}>
                                    <Checkbox
                                        id={`inv-${inventory.inventoryID}`}
                                        checked={isSelected}
                                        onCheckedChange={(checked) => handleInventoryCheck(inventory.inventoryID, checked as boolean)}
                                        className="data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                                    />
                                    <div className="flex-1 space-y-3">
                                        <label
                                            htmlFor={`inv-${inventory.inventoryID}`}
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
                                                        value={selectedItems[inventory.inventoryID]?.quantity || ""}
                                                        onChange={(e) => updateItem(inventory.inventoryID, "quantity", parseFloat(e.target.value) || 0)}
                                                        className="h-9 text-sm border-gray-200 focus:border-yellow-500 focus:ring-yellow-500"
                                                    />
                                                </div>
                                                <div className="flex-1 max-w-[150px]">
                                                    <Select
                                                        value={selectedItems[inventory.inventoryID]?.unit || ""}
                                                        onValueChange={(value) => updateItem(inventory.inventoryID, "unit", value)}
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
                        disabled={Object.keys(selectedItems).length === 0}
                    >
                        {t("shopping.createOrder")}
                    </Button>
                </div>
            </div>
        </div>
    )
}
