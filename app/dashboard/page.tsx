import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ChefHat, Scale, TrendingUp } from "lucide-react"

export default function Dashboard() {
  const stats = [
    {
      title: "Total Inventory Items",
      value: "156",
      icon: Package,
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      title: "Active Recipes",
      value: "43",
      icon: ChefHat,
      change: "+8%",
      changeType: "positive" as const,
    },
    {
      title: "Usage Units",
      value: "12",
      icon: Scale,
      change: "0%",
      changeType: "neutral" as const,
    },
    {
      title: "Monthly Growth",
      value: "23%",
      icon: TrendingUp,
      change: "+5%",
      changeType: "positive" as const,
    },
  ] as {
    title: string
    value: string
    icon: React.ElementType
    change: string
    changeType: "positive" | "neutral" | "negative"
  }[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to Mallow Sale Back Office</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-yellow-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p
                className={`text-xs ${
                  stat.changeType === "positive"
                    ? "text-green-600"
                    : stat.changeType === "negative"
                      ? "text-red-600"
                      : "text-gray-600"
                }`}
              >
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Recent Inventory Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Premium Flour", action: "Updated", time: "2 hours ago" },
                { name: "Organic Sugar", action: "Added", time: "4 hours ago" },
                { name: "Vanilla Extract", action: "Updated", time: "6 hours ago" },
                { name: "Butter", action: "Updated", time: "1 day ago" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.action}</p>
                  </div>
                  <span className="text-sm text-gray-500">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Popular Recipes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Classic Marshmallow", ingredients: 8, usage: "High" },
                { name: "Chocolate Delight", ingredients: 12, usage: "Medium" },
                { name: "Strawberry Special", ingredients: 10, usage: "High" },
                { name: "Vanilla Dream", ingredients: 6, usage: "Low" },
              ].map((recipe, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{recipe.name}</p>
                    <p className="text-sm text-gray-600">{recipe.ingredients} ingredients</p>
                  </div>
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${
                      recipe.usage === "High"
                        ? "bg-green-100 text-green-800"
                        : recipe.usage === "Medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {recipe.usage}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
