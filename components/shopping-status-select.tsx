"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useTranslation } from "@/hooks/use-translation"
import { ShoppingStatusCode } from "@/types/shopping"
import { cn } from "@/lib/utils"

interface ShoppingStatusSelectProps {
    currentStatus: ShoppingStatusCode
    onStatusChange: (status: ShoppingStatusCode) => void
    disabled?: boolean
    className?: string
}

export function ShoppingStatusSelect({
    currentStatus,
    onStatusChange,
    disabled = false,
    className
}: ShoppingStatusSelectProps) {
    const { t } = useTranslation()

    const getStatusColor = (status: ShoppingStatusCode) => {
        switch (status) {
            case "PENDING":
                return "text-yellow-800 bg-yellow-100 border-yellow-200"
            case "IN_PROGRESS":
                return "text-blue-800 bg-blue-100 border-blue-200"
            case "SUCCESS":
                return "text-green-800 bg-green-100 border-green-200"
            case "CANCEL":
                return "text-red-800 bg-red-100 border-red-200"
            default:
                return "text-gray-800 bg-gray-100 border-gray-200"
        }
    }

    return (
        <Select
            value={currentStatus}
            onValueChange={(value) => onStatusChange(value as ShoppingStatusCode)}
            disabled={disabled}
        >
            <SelectTrigger
                className={cn(
                    "w-[160px] h-8 text-xs font-medium border rounded-full px-3",
                    getStatusColor(currentStatus),
                    className
                )}
            >
                <SelectValue placeholder={t(`shopping.status.${currentStatus === "IN_PROGRESS" ? "inProgress" : currentStatus.toLowerCase()}`)} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="PENDING" className="text-yellow-600 focus:text-yellow-700 focus:bg-yellow-50">
                    {t("shopping.status.pending")}
                </SelectItem>
                <SelectItem value="IN_PROGRESS" className="text-blue-600 focus:text-blue-700 focus:bg-blue-50">
                    {t("shopping.status.inProgress")}
                </SelectItem>
                <SelectItem value="SUCCESS" className="text-green-600 focus:text-green-700 focus:bg-green-50">
                    {t("shopping.status.success")}
                </SelectItem>
                <SelectItem value="CANCEL" className="text-red-600 focus:text-red-700 focus:bg-red-50">
                    {t("shopping.status.cancel")}
                </SelectItem>
            </SelectContent>
        </Select>
    )
}
