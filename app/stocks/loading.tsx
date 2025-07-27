import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <Card className="border-yellow-200">
        <CardHeader>
          <CardTitle className="text-gray-900">
            <Skeleton className="h-6 w-32" />
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-64" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {[...Array(8)].map((_, i) => (
                    <th key={i} className="text-left py-3 px-4">
                      <Skeleton className="h-4 w-16" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-12" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-6 w-16" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
