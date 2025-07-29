import { Skeleton } from "@/components/ui/skeleton"

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

      <div className="border-yellow-200 rounded-lg shadow bg-white">
        <div className="px-6 pt-6">
          <Skeleton className="h-6 w-32" />
          <div className="flex items-center space-x-2 mt-2">
            <Skeleton className="h-10 w-64" />
          </div>
        </div>
        <div className="px-6 pb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {[...Array(5)].map((_, i) => (
                    <th key={i} className="text-left py-3 px-4">
                      <Skeleton className="h-4 w-16" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-gray-100">
                    {[...Array(5)].map((_, cellIndex) => (
                      <td key={cellIndex} className="py-3 px-4">
                        <Skeleton className="h-4 w-16" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

