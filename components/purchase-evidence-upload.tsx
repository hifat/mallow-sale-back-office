"use client"

import { useCallback, useRef, useState } from "react"
import { Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

export interface PurchaseEvidenceFile {
  id: string
  url: string
  name: string
  file?: File
}

interface PurchaseEvidenceUploadProps {
  files: PurchaseEvidenceFile[]
  onFilesChange: (files: PurchaseEvidenceFile[]) => void
  disabled?: boolean
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

function isImageFile(file: File) {
  return ACCEPTED_TYPES.includes(file.type) || file.type.startsWith("image/")
}

export function PurchaseEvidenceUpload({
  files,
  onFilesChange,
  disabled = false,
}: PurchaseEvidenceUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const selected = Array.from(incoming).filter(isImageFile)
      if (!selected.length) return

      const next = [
        ...files,
        ...selected.map((file) => ({
          id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
          url: URL.createObjectURL(file),
          name: file.name,
          file,
        })),
      ]
      onFilesChange(next)
    },
    [files, onFilesChange]
  )

  const removeFile = (id: string) => {
    const target = files.find((f) => f.id === id)
    if (target?.url.startsWith("blob:")) {
      URL.revokeObjectURL(target.url)
    }
    onFilesChange(files.filter((f) => f.id !== id))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return
    addFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-900">Purchase Evidence</p>

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (disabled) return
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click()
        }}
        onDragEnter={(e) => {
          e.preventDefault()
          if (!disabled) setIsDragging(true)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setIsDragging(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          setIsDragging(false)
        }}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors cursor-pointer",
          disabled && "cursor-not-allowed opacity-60",
          isDragging
            ? "border-yellow-500 bg-yellow-50"
            : "border-gray-200 bg-gray-50/50 hover:border-yellow-300 hover:bg-yellow-50/40"
        )}
      >
        <Upload className="h-5 w-5 text-gray-400" />
        <p className="text-sm text-gray-600">
          Drag and drop images here, or click to browse
        </p>
        <p className="text-xs text-gray-400">Supports multiple image files</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files)
            e.target.value = ""
          }}
        />
      </div>

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file) => (
            <div key={file.id} className="relative group">
              <button
                type="button"
                onClick={() => setPreviewUrl(file.url)}
                className="block overflow-hidden rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={file.url}
                  alt={file.name}
                  className="size-[60px] md:size-20 object-cover"
                />
              </button>
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(file.id)
                  }}
                  className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-gray-900/80 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto border-0 bg-transparent p-0 shadow-none sm:max-w-[90vw]">
          <DialogTitle className="sr-only">Purchase evidence preview</DialogTitle>
          {previewUrl && (
            <div className="relative flex max-h-[85vh] w-full items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Purchase evidence preview"
                className="max-h-[85vh] max-w-full rounded-lg object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
