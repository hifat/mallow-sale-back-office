"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTranslation } from "@/hooks/use-translation"
import type { PaymentTypeCode } from "@/types/purchase"
import { cn } from "@/lib/utils"

interface PurchasePaymentTypeSelectProps {
  value: PaymentTypeCode
  onChange: (value: PaymentTypeCode) => void
  disabled?: boolean
  className?: string
}

export function PurchasePaymentTypeSelect({
  value,
  onChange,
  disabled = false,
  className,
}: PurchasePaymentTypeSelectProps) {
  const { t } = useTranslation()

  const paymentLabelKey: Record<PaymentTypeCode, string> = {
    CASH: "cash",
    E_PAYMENT: "ePayment",
    CREDIT_CARD: "creditCard",
  }

  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as PaymentTypeCode)}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          "w-[180px] h-9 text-sm border-yellow-200 focus:border-yellow-500",
          className
        )}
      >
        <SelectValue placeholder={t("purchase.paymentType.label")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="CASH">{t("purchase.paymentType.cash")}</SelectItem>
        <SelectItem value="E_PAYMENT">
          {t("purchase.paymentType.ePayment")}
        </SelectItem>
        <SelectItem value="CREDIT_CARD">
          {t("purchase.paymentType.creditCard")}
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
