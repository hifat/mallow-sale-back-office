"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { fetchSuppliers, Supplier } from "@/lib/supplier-api"
import { createShoppingInventory } from "@/lib/shopping-api"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/hooks/use-translation"

interface ShoppingInventoryModalProps {
    inventoryId: string | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ShoppingInventoryModal({ inventoryId, open, onOpenChange }: ShoppingInventoryModalProps) {
    const { t } = useTranslation()
    const { toast } = useToast()
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [selectedSupplierId, setSelectedSupplierId] = useState<string>("")
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (open) {
            setLoading(true)
            fetchSuppliers()
                .then((res) => setSuppliers(res.items))
                .catch((err) => console.error("Failed to fetch suppliers", err))
                .finally(() => setLoading(false))
        } else {
            // Reset state when closed
            setSelectedSupplierId("")
        }
    }, [open])

    const handleSubmit = async () => {
        if (!inventoryId || !selectedSupplierId) return

        setSubmitting(true)
        try {
            await createShoppingInventory({
                inventoryID: inventoryId,
                supplierID: selectedSupplierId,
            })
            toast({
                title: "Success",
                description: "Added to shopping list successfully",
            })
            onOpenChange(false)
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to add to shopping list",
            })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Select Supplier</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Supplier
                        </label>
                        <Select
                            value={selectedSupplierId}
                            onValueChange={setSelectedSupplierId}
                            disabled={loading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={loading ? "Loading..." : "Select a supplier"} />
                            </SelectTrigger>
                            <SelectContent>
                                {suppliers.map((supplier) => (
                                    <SelectItem key={supplier.id} value={supplier.id}>
                                        {supplier.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!selectedSupplierId || submitting || loading}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                        {submitting ? "Adding..." : "Add to Shopping"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
