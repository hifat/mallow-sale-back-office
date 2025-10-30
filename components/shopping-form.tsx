"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CardContent } from "@/components/ui/card"
import { ModalCard, ModalCardHeader } from "@/components/ui/modal-card"
import { FormActionRow } from "@/components/ui/FormActionRow"
import { USAGE_UNITS } from "@/types/usage-unit"
import { shoppingSchema, type ShoppingInput } from "@/types/shopping";

interface ShoppingFormProps {
  item?: Partial<ShoppingInput> | null;
  onSave: (data: ShoppingInput) => void;
  onCancel: () => void;
}

export function ShoppingForm({ item, onSave, onCancel }: ShoppingFormProps) {
  const [formData, setFormData] = useState<ShoppingInput>({
    isComplete: item?.isComplete ?? false,
    name: item?.name || "",
    purchaseQuantity: item?.purchaseQuantity ?? 1,
    purchaseUnit: item?.purchaseUnit || { code: "", },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const parsed = shoppingSchema.safeParse(formData);
    if (!parsed.success) {
      const newErrors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        const field = err.path[0];
        if (typeof field === "string") {
          newErrors[field] = err.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    onSave({ ...formData })
    setIsLoading(false)
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  return (
    <ModalCard maxWidth="max-w-2xl">
      <ModalCardHeader
        title={item ? "Edit Shopping Item" : "Add New Shopping Item"}
        onClose={onCancel}
      />
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={errors.name ? "border-red-500" : "border-yellow-200 focus:border-yellow-500"}
                placeholder="Enter shopping item name"
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchaseQuantity">Quantity *</Label>
              <Input
                id="purchaseQuantity"
                type="number"
                min="0"
                value={formData.purchaseQuantity}
                onChange={(e) => handleChange("purchaseQuantity", Number.parseFloat(e.target.value) || 0)}
                className={errors.purchaseQuantity ? "border-red-500" : "border-yellow-200 focus:border-yellow-500"}
                placeholder="0"
              />
              {errors.purchaseQuantity && <p className="text-sm text-red-600">{errors.purchaseQuantity}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchaseUnit">Unit *</Label>
              <Select value={formData.purchaseUnit.code} onValueChange={(value) => handleChange("purchaseUnit", { code: value })}>
                <SelectTrigger className={errors.purchaseUnit ? "border-red-500" : "border-yellow-200 focus:border-yellow-500"}>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {USAGE_UNITS.map((unit) => (
                    <SelectItem key={unit.code} value={unit.code}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.purchaseUnit && <p className="text-sm text-red-600">{errors.purchaseUnit}</p>}
            </div>
          </div>

          <FormActionRow onCancel={onCancel} loading={isLoading} isEdit={!!item} saveLabel="Save" addLabel="Add" />
        </form>
      </CardContent>
    </ModalCard>
  )
}


