"use client"

import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { ModalCard, ModalCardHeader } from "@/components/ui/modal-card"
import { Badge } from "@/components/ui/badge"
import { Edit, Calendar, DollarSign, Package, Percent } from "lucide-react"
import { formatDate, calculateActualPrice, calculateCostPerUnit } from "@/lib/utils"
import type { Inventory } from "@/types/inventory";

interface InventoryDetailsProps {
  item: Inventory
  onClose: () => void
  onEdit: (item: Inventory) => void
}

export function InventoryDetails({ item, onClose, onEdit }: InventoryDetailsProps) {
  return (
    <ModalCard maxWidth="max-w-2xl">
      <ModalCardHeader
        title="Inventory Details"
        onClose={onClose}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(item)}
            className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        }
      />
        <CardContent className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{item.name}</h2>
            {item.remark && <p className="text-gray-600">{item.remark}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Purchase Price</p>
                  <p className="text-lg font-semibold text-gray-900">${item.purchasePrice.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Purchase Quantity</p>
                  <div className="text-lg font-semibold text-gray-900">
                    {item.purchaseQuantity}
                    <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800">
                      {item.purchaseUnit?.name || item.purchaseUnit?.code}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <Percent className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Yield Percentage</p>
                  <p className="text-lg font-semibold text-gray-900">{item.yieldPercentage}%</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="text-lg font-semibold text-gray-900">{formatDate(item.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Calculated Values</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Effective Quantity</p>
                <p className="text-lg font-semibold text-gray-900">
                  {((item.purchaseQuantity * item.yieldPercentage) / 100).toFixed(2)} {item.purchaseUnit?.name || item.purchaseUnit?.code}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Cost per Unit</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${calculateCostPerUnit(item.purchasePrice, item.purchaseQuantity).toFixed(2)} per {item.purchaseUnit?.name || item.purchaseUnit?.code}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Actual Price</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${calculateActualPrice(item.purchasePrice, item.yieldPercentage).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Created: {formatDate(item.createdAt)}</span>
              <span>ID: {item.id}</span>
            </div>
          </div>
        </CardContent>
    </ModalCard>
  )
}
