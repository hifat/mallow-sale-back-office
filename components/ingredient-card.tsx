import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface IngredientCardProps {
  name: ReactNode;
  costPerUnit?: number;
  quantity: number;
  unit: string;
  costUsed?: number;
  right?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function IngredientCard({
  name,
  costPerUnit,
  quantity,
  unit,
  costUsed,
  right,
  children,
  className = "",
}: IngredientCardProps) {
  return (
    <Card className={`border-gray-200 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">{name}</p>
            {typeof costPerUnit === 'number' && (
              <p className="text-sm text-gray-600">Cost per unit: ฿{costPerUnit.toFixed(2)}</p>
            )}
            {children}
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-900">
              {quantity} {unit}
            </p>
            {typeof costUsed === 'number' && (
              <p className="text-sm text-gray-700">Cost used: ฿{costUsed.toFixed(2)}</p>
            )}
            {right}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 