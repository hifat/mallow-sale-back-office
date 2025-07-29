"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "@/hooks/use-translation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CardContent } from "@/components/ui/card"
import { ModalCard, ModalCardHeader } from "@/components/ui/modal-card"
import { fetchPromotionById, type Promotion } from "@/lib/promotion-api"
import { formatDate } from "@/lib/utils"
import { Edit, Calendar, Tag, Percent } from "lucide-react"

interface PromotionDetailsProps {
  promotionId: string
  onClose: () => void
  onEdit?: (promotion: Promotion) => void
}

export function PromotionDetails({ promotionId, onClose, onEdit }: PromotionDetailsProps) {
  const [promotion, setPromotion] = useState<Promotion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPromotion = async () => {
      try {
        setLoading(true)
        const { item } = await fetchPromotionById(promotionId)
        setPromotion(item)
      } catch (err) {
        setError("Failed to load promotion details")
        console.error("Failed to fetch promotion details:", err)
      } finally {
        setLoading(false)
      }
    }

    loadPromotion()
  }, [promotionId])

  const getPromotionBadge = (typeCode: string) => {
    switch (typeCode) {
      case 'DISCOUNT':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Discount</Badge>
      case 'PAIR':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Pair</Badge>
      case 'FORCE_PRICE':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Fixed Price</Badge>
      case 'OTHER':
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Other</Badge>
    }
  }

  const renderPromotionValue = () => {
    if (!promotion) return null
    
    switch (promotion.type.code) {
      case 'DISCOUNT':
        return (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-3xl font-bold text-blue-700">{promotion.discount}%</div>
            <div className="text-sm text-blue-600 mt-1">Discount on selected items</div>
          </div>
        )
      case 'FORCE_PRICE':
        return (
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-3xl font-bold text-green-700">${promotion.price?.toFixed(2)}</div>
            <div className="text-sm text-green-600 mt-1">Fixed price for selected items</div>
          </div>
        )
      case 'PAIR':
        return (
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-3xl font-bold text-purple-700">Pair Deal</div>
            <div className="text-sm text-purple-600 mt-1">{promotion.products.length} items included</div>
          </div>
        )
      default:
        return null
    }
  }

  const { t } = useTranslation()
  if (loading) {
    return (
      <ModalCard maxWidth="max-w-2xl">
        <ModalCardHeader title={t("promotions.promotionDetails")} onClose={onClose} />
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">{t("promotions.loadingDetails")}</div>
          </div>
        </CardContent>
      </ModalCard>
    )
  }

  if (error || !promotion) {
    return (
      <ModalCard maxWidth="max-w-2xl">
        <ModalCardHeader title={t("promotions.promotionDetails")} onClose={onClose} />
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">{error || t("promotions.notFound")}</div>
          </div>
        </CardContent>
      </ModalCard>
    )
  }

  return (
    <ModalCard maxWidth="max-w-2xl">
      <ModalCardHeader
        title={t("promotions.promotionDetails")}
        onClose={onClose}
        actions={onEdit && promotion ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(promotion)}
            className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
          >
            <Edit className="h-4 w-4 mr-2" />
            {t("promotions.edit")}
          </Button>
        ) : undefined}
      />
      <CardContent className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{promotion.name}</h2>
          {promotion.detail && <p className="text-gray-600">{promotion.detail}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <Tag className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">{t("promotions.type")}</p>
                <p className="text-lg font-semibold text-gray-900">{promotion.type.name}</p>
              </div>
            </div>
            {promotion.type.code === 'DISCOUNT' && (
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <Percent className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">{t("promotions.discount")}</p>
                  <p className="text-lg font-semibold text-gray-900">{promotion.discount}%</p>
                </div>
              </div>
            )}
            {promotion.type.code === 'FORCE_PRICE' && (
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Tag className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">{t("promotions.price")}</p>
                  <p className="text-lg font-semibold text-gray-900">฿{promotion.price?.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">{t("common.updatedAt")}</p>
                <p className="text-lg font-semibold text-gray-900">{formatDate(promotion.updatedAt)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Tag className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">{t("promotions.products")}</p>
                <p className="text-lg font-semibold text-gray-900">{promotion.products.length} {t("promotions.products")}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">{t("common.createdAt")}</h4>
              <p className="text-gray-900">{formatDate(promotion.createdAt)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">{t("common.updatedAt")}</h4>
              <p className="text-gray-900">{formatDate(promotion.updatedAt)}</p>
            </div>
          </div>
        </div>
        {promotion.products.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t("promotions.products")}</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {promotion.products.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-md p-3 bg-white">
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">฿{product.price?.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </ModalCard>
  )
}
