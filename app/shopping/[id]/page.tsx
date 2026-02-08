"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft } from "lucide-react"
import type { ShoppingOrder } from "@/types/shopping"
import { getShoppingDetail, updateShoppingStatus } from "@/lib/shopping-api"
import { ShoppingStatusSelect } from "@/components/shopping-status-select"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/hooks/use-translation"

export default function ShoppingDetailPage() {
    const params = useParams<{ id: string }>()
    const router = useRouter()
    const { toast } = useToast()
    const { t } = useTranslation()
    const [order, setOrder] = useState<ShoppingOrder | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrder = async () => {
            if (!params?.id) return
            try {
                const data = await getShoppingDetail(params.id)
                setOrder(data)
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: t("common.error"),
                    description: error.message || t("shopping.toast.fetchDetailError")
                })
            } finally {
                setLoading(false)
            }
        }
        fetchOrder()
    }, [params.id, toast, t])

    const getStatusBadgeClass = (statusCode: string) => {
        switch (statusCode) {
            case "PENDING":
                return "bg-yellow-100 text-yellow-800"
            case "IN_PROGRESS":
                return "bg-blue-100 text-blue-800"
            case "SUCCESS":
                return "bg-green-100 text-green-800"
            case "CANCEL":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"

        }
    }

    if (loading) {
        return (
            <div className="space-y-6 max-w-5xl mx-auto pb-20">
                <Button variant="ghost" disabled>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    {t("common.back")}
                </Button>
                <div className="grid gap-6">
                    <Skeleton className="h-[200px] w-full" />
                    <Skeleton className="h-[400px] w-full" />
                </div>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh]">
                <h2 className="text-xl font-semibold mb-4">{t("shopping.notFound")}</h2>
                <Button onClick={() => router.push("/shopping")}>
                    {t("shopping.backToShopping")}
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20">
            <div>
                <Button variant="ghost" onClick={() => router.back()} className="hover:bg-gray-100">
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    {t("common.back")}
                </Button>
            </div>

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("shopping.orderDetail")}</h1>
                    <div className="flex items-center space-x-2 text-gray-500">
                        <span>{t("shopping.orderId")}: {order.id}</span>
                        <span>•</span>
                        <span>{new Date(order.createdAt).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                        })}</span>
                    </div>
                </div>
                <ShoppingStatusSelect
                    currentStatus={order.status.code}
                    onStatusChange={async (status) => {
                        try {
                            await updateShoppingStatus(order.id, status)
                            setOrder({ ...order, status: { ...order.status, code: status } })
                            toast({ title: t("common.success"), description: t("shopping.toast.updateSuccess") })
                        } catch (error) {
                            toast({
                                variant: "destructive",
                                title: t("common.error"),
                                description: t("shopping.toast.updateError")
                            })
                        }
                    }}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t("shopping.supplierInfo")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">{t("suppliers.supplier")}</p>
                            <p className="text-lg font-medium">{order.supplierName || "-"}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t("shopping.orderItems")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-medium text-gray-900">#</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t("common.name")}</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t("inventory.quantity")}</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t("inventory.unit")}</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t("common.status")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.inventories?.map((item, index) => (
                                    <tr key={item.inventoryID} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-gray-500">{index + 1}</td>
                                        <td className="py-3 px-4 font-medium">{item.inventoryName}</td>
                                        <td className="py-3 px-4">{item.purchaseQuantity}</td>
                                        <td className="py-3 px-4">
                                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                                {item.purchaseUnit.name || item.purchaseUnit.code}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge variant="outline" className={getStatusBadgeClass(item.status.code)}>
                                                {t(`shopping.status.${item.status.code === "IN_PROGRESS" ? "inProgress" : item.status.code.toLowerCase()}`)}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
