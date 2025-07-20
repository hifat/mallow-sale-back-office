import React from "react";

interface CenteredEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

export function CenteredEmptyState({ icon, title, subtitle }: CenteredEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      {icon}
      <p className="text-gray-600">{title}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
} 