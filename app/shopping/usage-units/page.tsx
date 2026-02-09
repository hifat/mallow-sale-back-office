"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search, Edit, Trash2, Scale } from "lucide-react"
import { UsageUnitForm } from "@/components/usage-unit-form"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { ProductCard, ProductCardActions } from "@/components/product-card"
import { CenteredEmptyState } from "@/components/ui/CenteredEmptyState"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/hooks/use-translation"
import { ShoppingUsageUnit } from "@/types/shopping-usage-unit"
import {
    fetchShoppingUsageUnits,
    createShoppingUsageUnit,
    updateShoppingUsageUnit,
    deleteShoppingUsageUnit
} from "@/lib/shopping-usage-unit-api"
import { useRouter } from "next/navigation"

// Since UsageUnitForm expects a specific interface, we might need to adapt or update the component.
// The existing UsageUnitForm expects:
// interface UsageUnit {
//   id: string
//   code: string
//   name: string
//   description?: string // ShoppingUsageUnit doesn't have description
//   createdAt: string
//   updatedAt: string
// }
// But ShoppingUsageUnit only has id, code, name.
// We can cast or update UsageUnitForm. 
// For now, I will assume UsageUnitForm can handle missing description/dates or I will pass dummy values.
// Actually, it's better to update UsageUnitForm or create a new one if it's too different.
// However, looking at usage-unit-form.tsx, it uses these fields.
// I will reuse it but map the types.

export default function ShoppingUsageUnitsPage() {
    const { toast } = useToast()
    const { t } = useTranslation()
    const [units, setUnits] = useState<ShoppingUsageUnit[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [showForm, setShowForm] = useState(false)
    const [editingUnit, setEditingUnit] = useState<ShoppingUsageUnit | null>(null)
    const [deletingUnit, setDeletingUnit] = useState<ShoppingUsageUnit | null>(null)
    const router = useRouter()

    const fetchUnits = async () => {
        try {
            const res = await fetchShoppingUsageUnits()
            setUnits(res.items)
        } catch (error) {
            toast({
                variant: "destructive",
                title: t("common.error"),
                description: t("shoppingUsageUnit.toast.fetchError")
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUnits()
    }, [])

    const filteredUnits = units.filter(
        (unit) =>
            unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            unit.code.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const handleSave = async (data: any) => {
        // data has code, name, description. We only need code, name.
        const payload = {
            code: data.code,
            name: data.name
        }

        try {
            if (editingUnit) {
                await updateShoppingUsageUnit(editingUnit.id, payload)
                toast({ title: t("common.success"), description: t("shoppingUsageUnit.toast.updateSuccess") })
            } else {
                await createShoppingUsageUnit(payload)
                toast({ title: t("common.success"), description: t("shoppingUsageUnit.toast.createSuccess") })
            }
            fetchUnits()
            setShowForm(false)
            setEditingUnit(null)
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: t("common.error"),
                description: error.message === "duplicated shopping usage unit"
                    ? t("shoppingUsageUnit.toast.duplicateError")
                    : t("shoppingUsageUnit.toast.saveError")
            })
        }
    }

    const handleDelete = async (unit: ShoppingUsageUnit) => {
        try {
            await deleteShoppingUsageUnit(unit.id)
            setUnits((prev) => prev.filter((u) => u.id !== unit.id))
            toast({ title: t("common.success"), description: t("shoppingUsageUnit.toast.deleteSuccess") })
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: t("common.error"),
                description: t("shoppingUsageUnit.toast.deleteError")
            })
        } finally {
            setDeletingUnit(null)
        }
    }

    const handleEdit = (unit: ShoppingUsageUnit) => {
        // Adapt to UsageUnitForm expectation
        const adaptedUnit = {
            ...unit,
            description: "",
            createdAt: "",
            updatedAt: ""
        }
        setEditingUnit(unit)
        setShowForm(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{t("shoppingUsageUnit.title")}</h1>
                    <p className="text-gray-600 mt-2">{t("shoppingUsageUnit.subtitle")}</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button onClick={() => router.push("/shopping")} variant="outline" className="border-yellow-500 text-yellow-600 hover:bg-yellow-50">
                        <Scale className="h-4 w-4 mr-2" />
                        {t("shopping.title")}
                    </Button>
                    <Button onClick={() => setShowForm(true)} className="bg-yellow-500 hover:bg-yellow-600 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        {t("shoppingUsageUnit.add")}
                    </Button>
                </div>
            </div>

            <Card className="border-yellow-200">
                <CardHeader>
                    <CardTitle className="text-gray-900 flex items-center">
                        <Scale className="h-5 w-5 mr-2 text-yellow-600" />
                        {t("shoppingUsageUnit.listTitle")}
                    </CardTitle>
                    <div className="flex items-center space-x-2 pt-3">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder={t("common.searchPlaceholder")}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 border-yellow-200 focus:border-yellow-500"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array(6).fill(0).map((_, i) => (
                                <Skeleton key={i} className="h-[120px] w-full" />
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredUnits.map((unit) => (
                                    <ProductCard
                                        key={unit.id}
                                        title={unit.name}
                                        badge={
                                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 mb-2">
                                                {unit.code}
                                            </Badge>
                                        }
                                        actions={
                                            <ProductCardActions>
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(unit)} className="hover:bg-yellow-50">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDeletingUnit(unit)}
                                                    className="hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </ProductCardActions>
                                        }
                                        className=""
                                    >
                                        {/* Shopping Usage Unit doesn't have metadata like UpdatedAt from API currently, so ignoring */}
                                    </ProductCard>
                                ))}
                            </div>

                            {filteredUnits.length === 0 && (
                                <CenteredEmptyState
                                    icon={<Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
                                    title={t("shoppingUsageUnit.emptyTitle")}
                                    subtitle={t("shoppingUsageUnit.emptySubtitle")}
                                />
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {showForm && (
                <UsageUnitForm
                    // We pass data that satisfies the form, stripping extra if needed or padding
                    unit={editingUnit ? { ...editingUnit, description: "", createdAt: "", updatedAt: "" } : null}
                    onSave={handleSave}
                    onCancel={() => {
                        setShowForm(false)
                        setEditingUnit(null)
                    }}
                />
            )}

            {deletingUnit && (
                <DeleteConfirmDialog
                    title={t("shoppingUsageUnit.deleteConfirm.title")}
                    description={t("shoppingUsageUnit.deleteConfirm.description", { name: deletingUnit.name, code: deletingUnit.code })}
                    onConfirm={() => handleDelete(deletingUnit)}
                    onCancel={() => setDeletingUnit(null)}
                />
            )}
        </div>
    )
}
