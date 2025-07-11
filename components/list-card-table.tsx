import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface ListCardTableProps {
  title: ReactNode;
  search?: ReactNode;
  table: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function ListCardTable({
  title,
  search,
  table,
  children,
  className = "",
}: ListCardTableProps) {
  return (
    <Card className={`border-yellow-200 ${className}`}>
      <CardHeader>
        <CardTitle className="text-gray-900">{title}</CardTitle>
        {search && <div className="flex items-center space-x-2">{search}</div>}
      </CardHeader>
      <CardContent>
        {table}
        {children}
      </CardContent>
    </Card>
  );
} 