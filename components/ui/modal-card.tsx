import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";

interface ModalCardProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}

export function ModalCard({ children, className = '', maxWidth = 'max-w-2xl' }: ModalCardProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto ${className}`}>{children}</Card>
    </div>
  );
}

interface ModalCardHeaderProps {
  title: React.ReactNode;
  onClose?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export function ModalCardHeader({ title, onClose, actions, className = '' }: ModalCardHeaderProps) {
  return (
    <CardHeader className={`flex flex-row items-center justify-between ${className}`}>
      <CardTitle className="text-gray-900 flex items-center">{title}</CardTitle>
      <div className="flex items-center space-x-2">
        {actions}
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </CardHeader>
  );
}

interface ModalCardActionsProps {
  onCancel?: () => void;
  onConfirm?: () => void;
  cancelText?: string;
  confirmText?: string;
  confirmVariant?: "default" | "destructive" | "outline";
  loading?: boolean;
  children?: React.ReactNode;
}

export function ModalCardActions({
  onCancel,
  onConfirm,
  cancelText = "Cancel",
  confirmText = "Confirm",
  confirmVariant = "default",
  loading = false,
  children,
}: ModalCardActionsProps) {
  return (
    <div className="flex justify-end space-x-2 mt-4">
      {onCancel && (
        <Button variant="outline" onClick={onCancel} type="button">
          {cancelText}
        </Button>
      )}
      {onConfirm && (
        <Button variant={confirmVariant} onClick={onConfirm} disabled={loading} type="button">
          {loading ? "Saving..." : confirmText}
        </Button>
      )}
      {children}
    </div>
  );
}
