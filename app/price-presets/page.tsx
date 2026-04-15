"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, CircleDollarSign } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import { fetchPricePresets } from "@/lib/price-preset-api"
import { updateInventoryPresetPrice } from "@/lib/inventory-api"
import type { PricePreset, Price } from "@/types/price-preset"
import { formatDate } from "@/lib/utils"
import { ListCardTable } from "@/components/list-card-table"
import { CenteredEmptyState } from "@/components/ui/CenteredEmptyState"
import { useToast } from "@/hooks/use-toast"

export default function PricePresetsPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [pricePresets, setPricePresets] = useState<PricePreset[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  })

  useEffect(() => {
    const loadPricePresets = async () => {
      setLoading(true)
      try {
        const response = await fetchPricePresets({
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm,
          sort: "created_at",
          order: "desc"
        })
        
        setPricePresets(response.items)
        setPagination(prev => ({
          ...prev,
          total: response.meta.total
        }))
      } catch (error) {
        console.error("Failed to fetch price presets:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPricePresets()
  }, [pagination.page, pagination.limit, searchTerm])

  useEffect(() => {
    if (searchTerm !== '') {
      setPagination(prev => ({
        ...prev,
        page: 1
      }))
    }
  }, [searchTerm])

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleUpdatePrice = async (presetId: string, inventoryId: string, price: Price) => {
    if (window.confirm("Are you sure you want to update the inventory price to ฿" + price.price.toFixed(2) + "?")) {
      setLoading(true);
      try {
        await updateInventoryPresetPrice(inventoryId, price.id);
        toast({
          title: t("common.success"),
          description: t("pricePresets.toast.updateSuccess"),
          className: "bg-green-50 text-green-900 border-green-200",
        });
      } catch (e: any) {
        toast({
          variant: "destructive",
          title: t("common.error"),
          description: e.message || t("pricePresets.toast.updateError"),
        });
      } finally {
        setLoading(false);
      }
    }
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit)

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">{t("pricePresets.title")}</h1>
					<p className="text-gray-600 mt-2">{t("pricePresets.subtitle")}</p>
				</div>
			</div>

			<ListCardTable
				title={t("pricePresets.management")}
				search={
					<div className="relative flex-1 max-w-sm pt-3">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
						<Input
							placeholder={t("common.searchPlaceholder")}
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 border-yellow-200 focus:border-yellow-500"
						/>
					</div>
				}
				table={
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b border-gray-200">
									<th className="text-left py-3 px-4 font-medium text-gray-900">{t("pricePresets.inventory")}</th>
									<th className="text-left py-3 px-4 font-medium text-gray-900">{t("pricePresets.prices")}</th>
									<th className="text-left py-3 px-4 font-medium text-gray-900">{t("pricePresets.created")}</th>
									<th className="text-left py-3 px-4 font-medium text-gray-900">{t("pricePresets.updated")}</th>
								</tr>
							</thead>
							<tbody>
								{loading ? (
									[...Array(5)].map((_, index) => (
										<tr key={index} className="border-b border-gray-100">
											<td className="py-3 px-4"><Skeleton className="h-4 w-32" /></td>
											<td className="py-3 px-4"><Skeleton className="h-4 w-48" /></td>
											<td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
											<td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
										</tr>
									))
								) : pricePresets.length === 0 ? (
									<tr>
										<td colSpan={4}>
											<CenteredEmptyState
												icon={<CircleDollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
												title={t("pricePresets.emptyTitle")}
												subtitle={t("pricePresets.emptySubtitle")}
											/>
										</td>
									</tr>
								) : (
									pricePresets.map((preset) => (
										<tr key={preset.id} className="border-b border-gray-100 hover:bg-gray-50">
											<td className="py-3 px-4">
												<div className="font-medium text-gray-900">
													{preset.inventory?.name || "-"}
												</div>
											</td>
											<td className="py-3 px-4">
												<div className="flex flex-wrap gap-2">
													{preset.prices?.map((p: Price) => (
                            <button
                              key={p.id}
                              onClick={() => handleUpdatePrice(preset.id, preset.inventoryID, p)}
                              className="focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-full transition-transform hover:scale-105"
                            >
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 cursor-pointer">
                                ฿{p.price.toFixed(2)}
                              </Badge>
                            </button>
                          ))}
                          {(!preset.prices || preset.prices.length === 0) && (
                            <span className="text-gray-400">-</span>
                          )}
												</div>
											</td>
											<td className="py-3 px-4">
												<span className="text-gray-500 text-sm">
													{formatDate(preset.createdAt)}
												</span>
											</td>
											<td className="py-3 px-4">
												<span className="text-gray-500 text-sm">
													{formatDate(preset.updatedAt)}
												</span>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				}
			>
				{totalPages > 1 && (
					<div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
						<div className="text-sm text-gray-700">
							Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
							{Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
							{pagination.total} results
						</div>
						<div className="flex space-x-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => handlePageChange(pagination.page - 1)}
								disabled={pagination.page === 1}
							>
								Previous
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => handlePageChange(pagination.page + 1)}
								disabled={pagination.page === totalPages}
							>
								Next
							</Button>
						</div>
					</div>
				)}
			</ListCardTable>
		</div>
	)
}
