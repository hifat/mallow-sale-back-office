import React from "react";
import { Button } from "@/components/ui/button";

interface FormActionRowProps {
  onCancel: () => void;
  loading?: boolean;
  isEdit?: boolean;
  addLabel?: string;
  saveLabel?: string;
}

export function FormActionRow({ onCancel, loading, isEdit, addLabel = "Add", saveLabel = "Save" }: FormActionRowProps) {
  return (
    <div className="flex justify-end space-x-2">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" disabled={loading}>
        {isEdit ? (loading ? "Saving..." : saveLabel) : (loading ? "Adding..." : addLabel)}
      </Button>
    </div>
  );
} 