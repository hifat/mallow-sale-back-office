"use client"

import { AlertTriangle } from "lucide-react"
import { ModalCard, ModalCardHeader, ModalCardActions } from "@/components/ui/modal-card"

interface DeleteConfirmDialogProps {
  title: string
  description: string
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirmDialog({ title, description, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  return (
    <ModalCard maxWidth="max-w-md">
      <ModalCardHeader
        title={<span className="flex items-center space-x-2 text-red-600"><AlertTriangle className="h-5 w-5" /><span>{title}</span></span>}
        onClose={onCancel}
      />
      <div className="p-6 space-y-4">
          <p className="text-gray-600">{description}</p>
        <ModalCardActions
          onCancel={onCancel}
          onConfirm={onConfirm}
          confirmText="Delete"
          confirmVariant="destructive"
        />
          </div>
    </ModalCard>
  )
}
