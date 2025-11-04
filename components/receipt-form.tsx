"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ModalCard, ModalCardHeader } from "@/components/ui/modal-card"
import { FormActionRow } from "@/components/ui/FormActionRow"
import { Upload, X, Trash2, Loader2 } from "lucide-react"
import { ReceiptItem, ReceiptItemInput } from "@/types/shopping"
import { readReceipt } from "@/lib/shopping-api"
import { fetchInventories } from "@/lib/inventory-api"
import type { Inventory } from "@/types/inventory"
import { useTranslation } from "@/hooks/use-translation"
import { useToast } from "@/components/ui/use-toast"

interface ReceiptFormProps {
  onCancel: () => void
}

export function ReceiptForm({ onCancel }: ReceiptFormProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [items, setItems] = useState<ReceiptItemInput[]>([])
  const [originalItems, setOriginalItems] = useState<ReceiptItem[]>([])
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [inventoryOptions, setInventoryOptions] = useState<Inventory[]>([])
  const [inventoryLoading, setInventoryLoading] = useState(false)
  const [activeInventoryIndex, setActiveInventoryIndex] = useState<number | null>(null)
  const [inventorySearchText, setInventorySearchText] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedImage) {
      toast({ title: t("common.error"), description: t("receipt.errors.noImage") })
      return
    }

    setIsUploading(true)
    setErrors({})

    try {
      const response = await readReceipt(selectedImage)
      setOriginalItems(response.items)
      setItems(response.items.map(item => ({
        inventoryID: item.inventoryID,
        name: item.name,
        nameEdited: item.nameEdited,
        purchasePrice: item.purchasePrice,
        purchaseQuantity: item.purchaseQuantity,
        remark: item.remark || "",
      })))
      setInventorySearchText(response.items.map(item => ""))
      toast({ title: t("common.success"), description: t("receipt.uploadSuccess") })
    } catch (error: any) {
      const errorMessage = error?.message || t("receipt.uploadError")
      toast({ title: t("common.error"), description: errorMessage })
    } finally {
      setIsUploading(false)
    }
  }

  const handleInventorySearch = async (search: string, index: number) => {
    setActiveInventoryIndex(index)
    setInventoryLoading(true)
    try {
      const res = await fetchInventories({ search })
      setInventoryOptions(res.items)
    } catch (e) {
      setInventoryOptions([])
    } finally {
      setInventoryLoading(false)
    }
  }

  const updateItem = (index: number, field: keyof ReceiptItemInput, value: any) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ))
    if (errors[`item_${index}_${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[`item_${index}_${field}`]
        return newErrors
      })
    }
  }

  const updateInventorySearchText = (index: number, value: string) => {
    setInventorySearchText(prev => {
      const updated = [...prev]
      updated[index] = value
      return updated
    })
  }

  const handleInventorySelect = (index: number, inventory: Inventory) => {
    updateItem(index, "inventoryID", inventory.id)
    updateItem(index, "nameEdited", inventory.name)
    updateInventorySearchText(index, inventory.name)
    setInventoryOptions([])
    setActiveInventoryIndex(null)
  }

  const handleDeleteItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
    setInventorySearchText(prev => prev.filter((_, i) => i !== index))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    items.forEach((item, index) => {
      if (!item.inventoryID.trim()) {
        newErrors[`item_${index}_inventoryID`] = t("receipt.errors.inventoryRequired")
      }
      if (item.purchasePrice < 0) {
        newErrors[`item_${index}_purchasePrice`] = t("receipt.errors.priceInvalid")
      }
      if (item.purchaseQuantity < 0) {
        newErrors[`item_${index}_purchaseQuantity`] = t("receipt.errors.quantityInvalid")
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      toast({ title: t("common.error"), description: t("receipt.errors.validationFailed") })
      return
    }

    setIsLoading(true)
    try {
      // Here you would typically save the items to the backend
      // For now, we'll just show a success message
      toast({ title: t("common.success"), description: t("receipt.saveSuccess") })
      // You can add an onSave callback prop if needed
    } catch (error: any) {
      toast({ title: t("common.error"), description: error?.message || t("receipt.saveError") })
    } finally {
      setIsLoading(false)
    }
  }

  const total = items.reduce((sum, item) => sum + (item.purchasePrice * item.purchaseQuantity), 0)

  return (
    <ModalCard maxWidth="max-w-4xl">
      <ModalCardHeader
        title={t("receipt.title")}
        onClose={onCancel}
      />
      <CardContent>
        {items.length === 0 ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="receipt-image">{t("receipt.uploadImage")} *</Label>
              <div className="border-2 border-dashed border-yellow-200 rounded-lg p-8 text-center">
                {imagePreview ? (
                  <div className="space-y-4">
                    <img
                      src={imagePreview}
                      alt="Receipt preview"
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    <div className="flex items-center justify-center space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setSelectedImage(null)
                          setImagePreview(null)
                          if (fileInputRef.current) {
                            fileInputRef.current.value = ""
                          }
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        {t("common.cancel")}
                      </Button>
                      <Button
                        type="button"
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {t("receipt.uploading")}
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            {t("receipt.upload")}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer"
                    >
                      <Label htmlFor="receipt-image" className="cursor-pointer">
                        <span className="text-yellow-600 hover:text-yellow-700 font-medium">
                          {t("receipt.clickToUpload")}
                        </span>
                        <span className="text-gray-600 ml-2">{t("receipt.orDragDrop")}</span>
                      </Label>
                      <Input
                        id="receipt-image"
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>
                    <p className="text-sm text-gray-500">{t("receipt.supportedFormats")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{t("receipt.items")}</h3>
                <div className="text-lg font-bold text-gray-900">
                  {t("receipt.total")}: {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              {items.map((item, index) => (
                <Card key={index} className="border-gray-200">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label>{t("receipt.inventoryID")} *</Label>
                        <Input
                          placeholder={t("receipt.searchInventory")}
                          value={inventorySearchText[index] || ""}
                          onFocus={() => setActiveInventoryIndex(index)}
                          onBlur={() => setTimeout(() => setActiveInventoryIndex(null), 200)}
                          onChange={async (e) => {
                            const value = e.target.value
                            updateInventorySearchText(index, value)
                            await handleInventorySearch(value, index)
                          }}
                          className={
                            errors[`item_${index}_inventoryID`]
                              ? "border-red-500"
                              : "border-yellow-200 focus:border-yellow-500"
                          }
                        />
                        <div className="relative">
                          {inventoryLoading && activeInventoryIndex === index && (
                            <div className="absolute left-0 top-0 text-xs text-gray-400">{t("receipt.searching")}</div>
                          )}
                          {!inventoryLoading && activeInventoryIndex === index && inventoryOptions.length > 0 && (
                            <div className="absolute z-10 bg-white border border-gray-200 rounded shadow w-full max-h-40 overflow-y-auto">
                              {inventoryOptions.map((inv) => (
                                <div
                                  key={inv.id}
                                  className="px-3 py-2 hover:bg-yellow-50 cursor-pointer text-sm"
                                  onClick={() => handleInventorySelect(index, inv)}
                                >
                                  {inv.name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {errors[`item_${index}_inventoryID`] && (
                          <p className="text-sm text-red-600">{errors[`item_${index}_inventoryID`]}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>{t("receipt.name")}</Label>
                        <Input
                          value={item.name}
                          disabled
                          className="border-gray-200 bg-gray-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{t("receipt.nameEdited")}</Label>
                        <Input
                          value={item.nameEdited}
                          onChange={(e) => updateItem(index, "nameEdited", e.target.value)}
                          className="border-yellow-200 focus:border-yellow-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{t("receipt.purchasePrice")} *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.purchasePrice}
                          onChange={(e) => updateItem(index, "purchasePrice", parseFloat(e.target.value) || 0)}
                          className={
                            errors[`item_${index}_purchasePrice`]
                              ? "border-red-500"
                              : "border-yellow-200 focus:border-yellow-500"
                          }
                        />
                        {errors[`item_${index}_purchasePrice`] && (
                          <p className="text-sm text-red-600">{errors[`item_${index}_purchasePrice`]}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>{t("receipt.purchaseQuantity")} *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.purchaseQuantity}
                          onChange={(e) => updateItem(index, "purchaseQuantity", parseFloat(e.target.value) || 0)}
                          className={
                            errors[`item_${index}_purchaseQuantity`]
                              ? "border-red-500"
                              : "border-yellow-200 focus:border-yellow-500"
                          }
                        />
                        {errors[`item_${index}_purchaseQuantity`] && (
                          <p className="text-sm text-red-600">{errors[`item_${index}_purchaseQuantity`]}</p>
                        )}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label>{t("receipt.remark")}</Label>
                        <Textarea
                          value={item.remark}
                          onChange={(e) => updateItem(index, "remark", e.target.value)}
                          className="border-yellow-200 focus:border-yellow-500"
                          rows={2}
                        />
                      </div>

                      <div className="md:col-span-2 flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteItem(index)}
                          className="border-red-500 text-red-600 hover:bg-red-50 bg-transparent"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t("common.delete")}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <FormActionRow
              onCancel={onCancel}
              loading={isLoading}
              isEdit={false}
              saveLabel={t("receipt.save")}
              addLabel={t("receipt.save")}
            />
          </form>
        )}
      </CardContent>
    </ModalCard>
  )
}

