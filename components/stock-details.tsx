"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CardContent } from "@/components/ui/card"
import { ModalCard, ModalCardHeader } from "@/components/ui/modal-card"
import { Edit, DollarSign, Package, Warehouse, User } from "lucide-react"
import { fetchStockById, Stock } from "@/lib/stock-api"
import { formatDate } from "@/lib/utils"

interface StockDetailsProps {
  stockId: string
  onClose: () => void
  onEdit?: (stock: Stock) => void
}

export function StockDetails({ stockId, onClose, onEdit }: StockDetailsProps) {
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
    <ModalCard maxWidth="max-w-2xl">
      <ModalCardHeader
        title="Stock Details"
        onClose={onClose}
        actions={
          onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(stock)}
              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )
        }
      />
      <CardContent className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {stock.inventory?.name || 'Stock Entry'}
          </h2>
          {stock.remark && <p className="text-gray-600">{stock.remark}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Purchase Price</p>
                <p className="text-lg font-semibold text-gray-900">${stock.purchasePrice.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Purchase Quantity</p>
                <div className="text-lg font-semibold text-gray-900">
                  {stock.purchaseQuantity}
                  <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800">
                    {stock.purchaseUnit?.name || stock.purchaseUnit?.code}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {stock.inventory && (
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <Warehouse className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Inventory</p>
                  <p className="text-lg font-semibold text-gray-900">{stock.inventory.name}</p>
                </div>
              </div>
            )}

            {stock.supplier && (
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <User className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Supplier</p>
                  <p className="text-lg font-semibold text-gray-900">{stock.supplier.name}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {stock.inventory && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Inventory Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Purchase Price</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${stock.inventory.purchasePrice.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Yield Percentage</p>
                <p className="text-lg font-semibold text-gray-900">
                  {stock.inventory.yieldPercentage}%
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Purchase Quantity</p>
                <p className="text-lg font-semibold text-gray-900">
                  {stock.inventory.purchaseQuantity} {stock.inventory.purchaseUnit?.name || stock.inventory.purchaseUnit?.code}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Cost per Unit</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${(stock.purchasePrice / stock.purchaseQuantity).toFixed(2)} per {stock.purchaseUnit?.name || stock.purchaseUnit?.code}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Created: {formatDate(stock.createdAt)}</span>
            <span>ID: {stock.id}</span>
          </div>
        </div>
      </CardContent>
    </ModalCard>
  )
}
