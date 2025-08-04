"use client"

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search, Edit, Trash2, Eye, Package2 } from "lucide-react"
import { StockForm } from "@/components/stock-form"
import { StockDetails } from "@/components/stock-details"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { useTranslation } from "@/hooks/use-translation"
import {
  fetchStocks,
  createStock,
  updateStock,
  deleteStock,
  Stock,
  StockPayload,
} from "@/lib/stock-api"
import { formatDate } from "@/lib/utils"
import { ListCardTable } from "@/components/list-card-table"
import { CenteredEmptyState } from "@/components/ui/CenteredEmptyState"

export default function StocksPage() {
  const { t } = useTranslation()
  const [stocks, setStocks] = useState<Stock[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<Stock | null>(null)
  const [deletingItem, setDeletingItem] = useState<Stock | null>(null)
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  })

  // Load stocks on component mount and when pagination/search changes
  useEffect(() => {
    const loadStocks = async () => {
      setLoading(true)
      try {
        const response = await fetchStocks({
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm,
          sort: "created_at",
          order: "desc"
        })
        
        setStocks(response.items)
        setPagination(prev => ({
          ...prev,
          total: response.meta.total
        }))
      } catch (error) {
        console.error("Failed to fetch stocks:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStocks()
  }, [pagination.page, pagination.limit, searchTerm])

  // Reset to page 1 when search term changes
  useEffect(() => {
    if (searchTerm !== '') {
      setPagination(prev => ({
        ...prev,
        page: 1
      }))
    }
  }, [searchTerm])

  const handleSave = async (data: StockPayload) => {
    setLoading(true)
    try {
      if (editingItem) {
        await updateStock(editingItem.id, data)
      } else {
        await createStock(data)
      }
      
      // Refresh the list
      const response = await fetchStocks({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        sort: "createdAt",
        order: "desc"
      })
      
      setStocks(response.items)
      setPagination(prev => ({
        ...prev,
        total: response.meta.total
      }))
      
      setShowForm(false)
      setEditingItem(null)
    } catch (error) {
      console.error("Failed to save stock:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (item: Stock) => {
    setDeletingItem(item)
  }

  const handleCloseDelete = () => {
    setDeletingItem(null)
  }

  const handleConfirmDelete = async () => {
    if (!deletingItem) return
    
    setLoading(true)
    try {
      await deleteStock(deletingItem.id)
      
      // Refresh the list
      const response = await fetchStocks({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        sort: "createdAt",
        order: "desc"
      })
      
      setStocks(response.items)
      setPagination(prev => ({
        ...prev,
        total: response.meta.total
      }))
      
      setDeletingItem(null)
    } catch (error) {
      console.error("Failed to delete stock:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleOpenForm = () => {
    setEditingItem(null)
    setShowForm(true)
  }

  const handleEdit = (item: Stock) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingItem(null)
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit)

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
					<p className="text-gray-600 mt-2">Manage your stock entries and purchase records</p>
				</div>
				<Button onClick={handleOpenForm} className="bg-yellow-500 hover:bg-yellow-600 text-white">
					<Plus className="h-4 w-4 mr-2" />
					{t("stocks.addStock")}
				</Button>
			</div>

			<ListCardTable
				title={t("stocks.entries")}
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
									<th className="text-left py-3 px-4 font-medium text-gray-900">{t("stocks.inventory")}</th>
									<th className="text-left py-3 px-4 font-medium text-gray-900">{t("stocks.supplier")}</th>
									<th className="text-left py-3 px-4 font-medium text-gray-900">{t("stocks.purchasePrice")}</th>
									<th className="text-left py-3 px-4 font-medium text-gray-900">{t("stocks.quantity")}</th>
									<th className="text-left py-3 px-4 font-medium text-gray-900">{t("inventory.unit")}</th>
									<th className="text-left py-3 px-4 font-medium text-gray-900">{t("stocks.remark")}</th>
									<th className="text-left py-3 px-4 font-medium text-gray-900">{t("stocks.created")}</th>
									<th className="text-left py-3 px-4 font-medium text-gray-900">{t("common.actions")}</th>
								</tr>
							</thead>
							<tbody>
								{loading ? (
									// Show skeleton loaders when data is loading
									[...Array(5)].map((_, index) => (
										<tr key={index} className="border-b border-gray-100">
											<td className="py-3 px-4">
												<Skeleton className="h-4 w-24" />
											</td>
											<td className="py-3 px-4">
												<Skeleton className="h-4 w-20" />
											</td>
											<td className="py-3 px-4">
												<Skeleton className="h-4 w-16" />
											</td>
											<td className="py-3 px-4">
												<Skeleton className="h-4 w-12" />
											</td>
											<td className="py-3 px-4">
												<Skeleton className="h-6 w-16" />
											</td>
											<td className="py-3 px-4">
												<Skeleton className="h-4 w-20" />
											</td>
											<td className="py-3 px-4">
												<Skeleton className="h-4 w-24" />
											</td>
											<td className="py-3 px-4">
												<div className="flex space-x-2">
													<Skeleton className="h-8 w-8 rounded" />
													<Skeleton className="h-8 w-8 rounded" />
													<Skeleton className="h-8 w-8 rounded" />
												</div>
											</td>
										</tr>
									))
								) : stocks.length === 0 ? (
									<tr>
										<td colSpan={8}>
											<CenteredEmptyState
												icon={<Package2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
												title="No stock entries found"
												subtitle="Create your first stock entry to get started"
											/>
										</td>
									</tr>
								) : (
									stocks.map((stock) => (
										<tr key={stock.id} className="border-b border-gray-100 hover:bg-gray-50">
											<td className="py-3 px-4">
												<div>
													<div className="font-medium text-gray-900">
														{stock.inventory?.name || "-"}
													</div>
												</div>
											</td>
											<td className="py-3 px-4">
												<div className="font-medium text-gray-900">
													{stock.supplier?.name || "-"}
												</div>
											</td>
											<td className="py-3 px-4">
												<span className="font-medium text-green-600">
													฿{stock.purchasePrice.toFixed(2)}
												</span>
											</td>
											<td className="py-3 px-4">
												<span className="text-gray-900">{stock.purchaseQuantity}</span>
											</td>
											<td className="py-3 px-4">
												<Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
													{stock.purchaseUnit.name}
												</Badge>
											</td>
											<td className="py-3 px-4">
												<span className="text-gray-600 text-sm">
													{stock.remark || "-"}
												</span>
											</td>
											<td className="py-3 px-4">
												<span className="text-gray-500 text-sm">
													{formatDate(stock.createdAt)}
												</span>
											</td>
											<td className="py-3 px-4">
												<div className="flex space-x-2">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => setShowDetails(stock.id)}
														className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
													>
														<Eye className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleEdit(stock)}
														className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50"
													>
														<Edit className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleDeleteClick(stock)}
														className="text-red-600 hover:text-red-800 hover:bg-red-50"
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
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

			{showForm && (
				<StockForm
					stock={editingItem}
					onSave={handleSave}
					onCancel={handleCloseForm}
				/>
			)}

			{showDetails && (
				<StockDetails
					stockId={showDetails}
					onClose={() => setShowDetails(null)}
				/>
			)}

			{deletingItem && (
				<DeleteConfirmDialog
					onCancel={() => setDeletingItem(null)}
					onConfirm={handleConfirmDelete}
					title="Delete Stock Entry"
					description={`Are you sure you want to delete this stock entry? This action cannot be undone.`}
				/>
			)}
		</div>
	)
}
