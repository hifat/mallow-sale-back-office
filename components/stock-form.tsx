"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CardContent } from "@/components/ui/card"
import { ModalCard, ModalCardHeader } from "@/components/ui/modal-card"
import { FormActionRow } from "@/components/ui/FormActionRow"
import { Stock, StockPayload } from "@/lib/stock-api"
import { fetchInventories, InventoryItem } from "@/lib/inventory-api"
import { fetchSuppliers, Supplier } from "@/lib/supplier-api"
import { USAGE_UNITS } from "@/types/usage-unit"

interface StockFormProps {
    stock?: Stock | null
    onSave: (data: StockPayload) => void
    onCancel: () => void
}

export function StockForm({ stock, onSave, onCancel }: StockFormProps) {
    const [formData, setFormData] = useState({
        inventoryID: stock?.inventoryID || "",
        supplierID: stock?.supplierID || "",
        purchasePrice: stock?.purchasePrice || 0,
        purchaseQuantity: stock?.purchaseQuantity || 0,
        purchaseUnit: stock?.purchaseUnit?.code || "",
        remark: stock?.remark || "",
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = useState(false)
    const [inventories, setInventories] = useState<InventoryItem[]>([])
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [loadingData, setLoadingData] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                const [inventoryData, supplierData] = await Promise.all([
                    fetchInventories(),
                    fetchSuppliers()
                ])
                setInventories(inventoryData.items)
                setSuppliers(supplierData.items)
            } catch (error) {
                console.error("Failed to load form data:", error)
            } finally {
                setLoadingData(false)
            }
        }

        loadData()
    }, [])

    const validate = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.inventoryID.trim()) {
            newErrors.inventoryID = "Inventory item is required"
        }

        if (!formData.supplierID.trim()) {
            newErrors.supplierID = "Supplier is required"
        }

        if (formData.purchasePrice <= 0) {
            newErrors.purchasePrice = "Purchase price must be greater than 0"
        }

        if (formData.purchaseQuantity <= 0) {
            newErrors.purchaseQuantity = "Purchase quantity must be greater than 0"
        }

        if (!formData.purchaseUnit.trim()) {
            newErrors.purchaseUnit = "Purchase unit is required"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleChange = (field: string, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return

        setIsLoading(true)
        try {
            const payload: StockPayload = {
                inventoryID: formData.inventoryID,
                supplierID: formData.supplierID,
                purchasePrice: formData.purchasePrice,
                purchaseQuantity: formData.purchaseQuantity,
                purchaseUnit: {
                    code: formData.purchaseUnit
                },
                remark: formData.remark || undefined,
            }
            await onSave(payload)
        } catch (error) {
            console.error("Failed to save stock:", error)
        } finally {
            setIsLoading(false)
        }
    }

    if (loadingData) {
        return (
            <ModalCard>
                <ModalCardHeader title={stock ? "Edit Stock Entry" : "Add New Stock Entry"} onClose={onCancel} />
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="text-gray-500">Loading form data...</div>
                    </div>
                </CardContent>
            </ModalCard>
        )
    }

    return (
        <ModalCard>
            <ModalCardHeader title={stock ? "Edit Stock Entry" : "Add New Stock Entry"} onClose={onCancel} />
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="inventoryID">Inventory Item *</Label>
                            <Select value={formData.inventoryID} onValueChange={(value) => handleChange("inventoryID", value)}>
                                <SelectTrigger
                                    className={errors.inventoryID ? "border-red-500" : "border-yellow-200 focus:border-yellow-500"}
                                >
                                    <SelectValue placeholder="Select inventory item" />
                                </SelectTrigger>
                                <SelectContent>
                                    {inventories.map((item) => (
                                        <SelectItem key={item.id} value={item.id}>
                                            {item.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.inventoryID && <p className="text-sm text-red-600">{errors.inventoryID}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="supplierID">Supplier *</Label>
                            <Select value={formData.supplierID} onValueChange={(value) => handleChange("supplierID", value)}>
                                <SelectTrigger
                                    className={errors.supplierID ? "border-red-500" : "border-yellow-200 focus:border-yellow-500"}
                                >
                                    <SelectValue placeholder="Select supplier" />
                                </SelectTrigger>
                                <SelectContent>
                                    {suppliers.map((supplier) => (
                                        <SelectItem key={supplier.id} value={supplier.id}>
                                            {supplier.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.supplierID && <p className="text-sm text-red-600">{errors.supplierID}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="purchasePrice">Purchase Price ($) *</Label>
                            <Input
                                id="purchasePrice"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.purchasePrice}
                                onChange={(e) => handleChange("purchasePrice", Number.parseFloat(e.target.value) || 0)}
                                className={errors.purchasePrice ? "border-red-500" : "border-yellow-200 focus:border-yellow-500"}
                                placeholder="0.00"
                            />
                            {errors.purchasePrice && <p className="text-sm text-red-600">{errors.purchasePrice}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="purchaseQuantity">Purchase Quantity *</Label>
                            <Input
                                id="purchaseQuantity"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.purchaseQuantity}
                                onChange={(e) => handleChange("purchaseQuantity", Number.parseFloat(e.target.value) || 0)}
                                className={errors.purchaseQuantity ? "border-red-500" : "border-yellow-200 focus:border-yellow-500"}
                                placeholder="0"
                            />
                            {errors.purchaseQuantity && <p className="text-sm text-red-600">{errors.purchaseQuantity}</p>}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="purchaseUnit">Purchase Unit *</Label>
                            <Select value={formData.purchaseUnit} onValueChange={(value) => handleChange("purchaseUnit", value)}>
                                <SelectTrigger
                                    className={errors.purchaseUnit ? "border-red-500" : "border-yellow-200 focus:border-yellow-500"}
                                >
                                    <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    {USAGE_UNITS.map((unit) => (
                                        <SelectItem key={unit.code} value={unit.code}>
                                            {unit.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.purchaseUnit && <p className="text-sm text-red-600">{errors.purchaseUnit}</p>}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="remark">Remark</Label>
                            <Textarea
                                id="remark"
                                value={formData.remark}
                                onChange={(e) => handleChange("remark", e.target.value)}
                                className="border-yellow-200 focus:border-yellow-500"
                                placeholder="Optional remarks or notes"
                                rows={3}
                            />
                        </div>
                    </div>
                    <div className="mt-4" >
                        <FormActionRow onCancel={onCancel} loading={isLoading} isEdit={!!stock} saveLabel="Save" addLabel="Add" />
                    </div>
                </form>
            </CardContent>
        </ModalCard>
    )
}
