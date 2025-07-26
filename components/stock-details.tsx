"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { CardContent } from "@/components/ui/card"
import { ModalCard, ModalCardHeader } from "@/components/ui/modal-card"
import { fetchStockById, Stock } from "@/lib/stock-api"
import { formatDate } from "@/lib/utils"

interface StockDetailsProps {
  stockId: string
  onClose: () => void
}

export function StockDetails({ stockId, onClose }: StockDetailsProps) {
  const [stock, setStock] = useState<Stock | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStock = async () => {
      try {
        setLoading(true)
        const stockData = await fetchStockById(stockId)
        setStock(stockData)
      } catch (err) {
        setError("Failed to load stock details")
        console.error("Failed to fetch stock details:", err)
      } finally {
        setLoading(false)
      }
    }

    loadStock()
  }, [stockId])

  if (loading) {
    return (
      <ModalCard>
        <ModalCardHeader title="Stock Details" onClose={onClose} />
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading stock details...</div>
          </div>
        </CardContent>
      </ModalCard>
    )
  }

  if (error || !stock) {
    return (
      <ModalCard>
        <ModalCardHeader title="Stock Details" onClose={onClose} />
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">{error || "Stock not found"}</div>
          </div>
        </CardContent>
      </ModalCard>
    )
  }

  return (
    <ModalCard>
      <ModalCardHeader title="Stock Details" onClose={onClose} />
      <CardContent>
        <div className="space-y-6">
          {/* Stock Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock ID</label>
                <p className="text-gray-900 font-mono text-sm">{stock.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
                <p className="text-green-600 font-semibold">${stock.purchasePrice.toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Quantity</label>
                <p className="text-gray-900">{stock.purchaseQuantity}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Unit</label>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {stock.purchaseUnit.name}
                </Badge>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
                <p className="text-gray-900">{stock.remark || "No remarks"}</p>
              </div>
            </div>
          </div>

          {/* Inventory Information */}
          {stock.inventory && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Item</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <p className="text-gray-900 font-semibold">{stock.inventory.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Yield Percentage</label>
                    <p className="text-gray-900">{stock.inventory.yieldPercentage}%</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Standard Purchase Price</label>
                    <p className="text-gray-900">${stock.inventory.purchasePrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Standard Purchase Quantity</label>
                    <p className="text-gray-900">
                      {stock.inventory.purchaseQuantity} {stock.inventory.purchaseUnit.name}
                    </p>
                  </div>
                  {stock.inventory.remark && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Inventory Remark</label>
                      <p className="text-gray-600 text-sm">{stock.inventory.remark}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Supplier Information */}
          {stock.supplier && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  {stock.supplier.imgUrl && (
                    <div className="flex-shrink-0">
                      <img
                        src={stock.supplier.imgUrl}
                        alt={stock.supplier.name}
                        className="w-16 h-16 rounded-lg object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <p className="text-gray-900 font-semibold">{stock.supplier.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Supplier ID</label>
                        <p className="text-gray-600 font-mono text-sm">{stock.supplier.id}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Timestamps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                <p className="text-gray-600">{formatDate(stock.createdAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Updated At</label>
                <p className="text-gray-600">{formatDate(stock.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </ModalCard>
  )
}
