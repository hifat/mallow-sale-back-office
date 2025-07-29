"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CardContent } from "@/components/ui/card"
import { ModalCard, ModalCardHeader } from "@/components/ui/modal-card"
import { FormActionRow } from "@/components/ui/FormActionRow"
import { Promotion, PromotionPayload, PromotionType, fetchPromotionTypes } from "@/lib/promotion-api"
import { fetchRecipes, Recipe } from "@/lib/recipe-api"
import { useTranslation } from "@/hooks/use-translation"

export interface PromotionFormProps {
  promotion?: Promotion | null
  onSave: (data: any) => Promise<void>
  onCancel: () => void
}

export function PromotionForm({ promotion, onSave, onCancel }: PromotionFormProps) {
  const { t } = useTranslation()
  interface PromotionFormData {
    type: string;
    name: string;
    detail: string; 
    discount: number;
    price: number;
    products: string[];
  }

  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false)
  const [recipesError, setRecipesError] = useState<string | null>(null)

  // Fetch recipes when PAIR type is selected
  useEffect(() => {
    const loadRecipes = async () => {
      if (promotion?.type?.code === 'PAIR') {
        setIsLoadingRecipes(true)
        setRecipesError(null)
        try {
          const items = await fetchRecipes()
          setRecipes(items || [])
        } catch (error) {
          console.error('Failed to fetch recipes:', error)
          setRecipesError(t('promotions.errors.failedToLoadRecipes'))
          setRecipes([])
        } finally {
          setIsLoadingRecipes(false)
        }
      } else {
        setRecipes([])
      }
    }

    loadRecipes()
  }, [promotion?.type?.code, t])

  const [formData, setFormData] = useState<PromotionFormData>({
    type: promotion?.type?.id || "",
    name: promotion?.name || "",
    detail: promotion?.detail || "",
    discount: promotion?.discount || 0,
    price: promotion?.price || 0,
    products: promotion?.products?.map(p => p.id) || []
  })
  
  const [promotionTypes, setPromotionTypes] = useState<PromotionType[]>([])
  const [selectedType, setSelectedType] = useState<PromotionType | null>(
    promotion?.type || null
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [loadingTypes, setLoadingTypes] = useState(false)

  useEffect(() => {
    const loadPromotionTypes = async () => {
      try {
        const types = await fetchPromotionTypes()
        setPromotionTypes(types)
        
        // If we're editing and have a promotion type, ensure it's selected
        if (promotion?.type) {
          const type = types.find(t => t.id === promotion.type.id)
          if (type) setSelectedType(type)
        }
      } catch (error) {
        console.error("Failed to load promotion types:", error)
      } finally {
        setLoadingTypes(false)
      }
    }

    loadPromotionTypes()
  }, [promotion])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.type) {
      newErrors.type = "Promotion type is required"
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    const typeCode = selectedType?.code || ""
    
    if (typeCode === 'DISCOUNT' && (!formData.discount || formData.discount <= 0)) {
      newErrors.discount = "Discount must be greater than 0"
    }

    if (typeCode === 'FORCE_PRICE' && (!formData.price || formData.price <= 0)) {
      newErrors.price = "Price must be greater than 0"
    }

    if (typeCode === 'PAIR' && formData.products.length < 2) {
      newErrors.products = "At least 2 products are required for pair promotions"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleTypeChange = (typeId: string) => {
    const type = promotionTypes.find(t => t.id === typeId)
    setSelectedType(type || null)
    handleChange('type', typeId)
    
    // Reset type-specific fields when type changes
    if (type?.code === 'DISCOUNT') {
      handleChange('price', 0)
    } else if (type?.code === 'FORCE_PRICE') {
      handleChange('discount', 0)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      const type = promotionTypes.find(t => t.id === formData.type)
      if (!type) throw new Error(t("promotions.errors.invalidType"))
      if (type.code === 'PAIR' && (!formData.products || formData.products.length === 0)) {
        setErrors((prev) => ({ ...prev, products: t("promotions.errors.productsRequired") }))
        setIsLoading(false)
        return
      }
      const payload: PromotionPayload = {
        type: {
          id: formData.type,
          code: type.code,
          name: type.name
        },
        name: formData.name,
        detail: formData.detail || undefined,
        discount: type.code === 'DISCOUNT' ? formData.discount : undefined,
        price: type.code === 'FORCE_PRICE' ? formData.price : undefined,
        products: type.code === 'PAIR' ? formData.products : undefined
      }

      await onSave(payload)
    } catch (error) {
      console.error(t("promotions.errors.saveFailed"), error)
    } finally {
      setIsLoading(false)
    }
  }

  if (loadingTypes) {
    return (
      <ModalCard maxWidth="max-w-2xl">
        <ModalCardHeader
          title={promotion ? t("promotions.editPromotion") : t("promotions.addPromotion")}
          onClose={onCancel}
        />
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">{t("promotions.loadingForm")}</div>
          </div>
        </CardContent>
      </ModalCard>
    )
  }

  return (
    <ModalCard maxWidth="max-w-2xl">
      <ModalCardHeader
        title={promotion ? t("promotions.editPromotion") : t("promotions.addPromotion")}
        onClose={onCancel}
      />
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">{t("promotions.type")}</Label>
              <Select
                value={formData.type}
                onValueChange={handleTypeChange}
                disabled={!!promotion}
              >
                <SelectTrigger className={errors.type ? "border-red-500" : "border-yellow-200 focus:border-yellow-500"}>
                  <SelectValue placeholder={t("promotions.typePlaceholder")}/>
                </SelectTrigger>
                <SelectContent>
                  {promotionTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-red-600">{errors.type}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">{t("promotions.name")}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={errors.name ? "border-red-500" : "border-yellow-200 focus:border-yellow-500"}
                placeholder={t("promotions.namePlaceholder")}
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="detail">{t("promotions.detail")}</Label>
              <Textarea
                id="detail"
                value={formData.detail}
                onChange={(e) => handleChange("detail", e.target.value)}
                className="border-yellow-200 focus:border-yellow-500"
                placeholder={t("promotions.detailPlaceholder")}
                rows={3}
              />
            </div>

            {selectedType?.code === 'DISCOUNT' && (
              <div className="space-y-2">
                <Label htmlFor="discount">{t("promotions.discount")}</Label>
                <div className="relative">
                  <Input
                    id="discount"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => handleChange("discount", Number(e.target.value))}
                    className={`pl-10 ${errors.discount ? "border-red-500" : "border-yellow-200 focus:border-yellow-500"}`}
                    placeholder="0"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
                {errors.discount && <p className="text-sm text-red-600">{errors.discount}</p>}
              </div>
            )}

            {selectedType?.code === 'FORCE_PRICE' && (
              <div className="space-y-2">
                <Label htmlFor="price">{t("promotions.price")}</Label>
                <div className="relative">
                  <Input
                    id="price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleChange("price", Number(e.target.value))}
                    className={`pl-8 ${errors.price ? "border-red-500" : "border-yellow-200 focus:border-yellow-500"}`}
                    placeholder="0.00"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">฿</span>
                </div>
                {errors.price && <p className="text-sm text-red-600">{errors.price}</p>}
              </div>
            )}

            {selectedType?.code === 'PAIR' && (
              <div className="space-y-2 md:col-span-2">
                <Label>{t("promotions.products")}</Label>
                {isLoadingRecipes ? (
                  <div className="p-4 text-center text-gray-500">
                    {t("promotions.loadingProducts")}
                  </div>
                ) : recipesError ? (
                  <div className="p-4 text-center text-red-500">
                    {recipesError}
                  </div>
                ) : (
                  <Select
                    value={formData.products?.[0] || ""}
                    onValueChange={(value: string) => handleChange("products", [value])}
                  >
                    <SelectTrigger className={errors.products ? "border-red-500" : "border-yellow-200 focus:border-yellow-500"}>
                      <SelectValue placeholder={t("promotions.productsPlaceholder")}>
                        {formData.products?.[0] && recipes.find(r => r.id === formData.products[0])?.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {recipes.map((recipe) => (
                        <SelectItem key={recipe.id} value={recipe.id}>
                          {recipe.name} {recipe.price ? `฿${recipe.price}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.products && <p className="text-sm text-red-600">{errors.products}</p>}
              </div>
            )}
          </div>

          <FormActionRow
            onCancel={onCancel}
            loading={isLoading}
            isEdit={!!promotion}
            saveLabel={t("common.save")}
            addLabel={t("common.add")}
          />
        </form>
      </CardContent>
    </ModalCard>
  )
}
