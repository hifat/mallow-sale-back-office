import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface ProductCardProps {
  title: ReactNode;
  badge?: ReactNode;
  price?: number;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function ProductCard({
  title,
  badge,
  price,
  actions,
  children,
  className = "",
}: ProductCardProps) {
  const showPrice = typeof price === 'number' && price > 0;
  // Check if children has content (not null/undefined/empty string)
  const hasContentAbove = !!children && (Array.isArray(children) ? children.some(Boolean) : true);
  return (
    <Card className={`border-gray-200 hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle
          className="text-lg text-gray-900 truncate max-w-[12rem] md:max-w-[16rem] lg:max-w-[24rem]"
          title={typeof title === 'string' ? title : undefined}
        >
          {title}
        </CardTitle>
        <div className="flex items-center justify-between mt-2">
          {badge}
          {showPrice && (
            <span className="text-2xl font-extrabold text-purple-700 ml-2">
              ฿{price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {(children || actions) && (
          <div className={`flex items-center justify-between pt-2 ${hasContentAbove ? 'border-t' : ''}`}>
            <div>{children}</div>
            {actions && <div className="flex items-center space-x-1">{actions}</div>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ProductCardActionsProps {
  children: ReactNode;
}

export function ProductCardActions({ children }: ProductCardActionsProps) {
  return <>{children}</>;
} 