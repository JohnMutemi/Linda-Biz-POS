"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, DollarSign, ShoppingCart, AlertTriangle, TrendingUp, Plus, Calendar, BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation"
import { BusinessTip } from "@/components/business-tip"

interface User {
  id: string
  name: string
  email: string
  userType: "general" | "wines-spirits"
  businessName: string
  phone?: string
  location?: string
}

interface Product {
  id: string
  name: string
  price: number
  quantity: number
  unit: string
  category: string
}

interface Sale {
  id: string
  items: any[]
  total: number
  date: string
  userId: string
  itemCount?: number
}

interface GeneralShopDashboardProps {
  user: User
}

export function GeneralShopDashboard({ user }: GeneralShopDashboardProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [todaySales, setTodaySales] = useState(0)
  const [totalStockValue, setTotalStockValue] = useState(0)
  const [weekSales, setWeekSales] = useState(0)
  const [monthSales, setMonthSales] = useState(0)
  const router = useRouter()

  useEffect(() => {
    // Load user's products from localStorage
    const allProducts = JSON.parse(localStorage.getItem("lindabiz_products") || "[]")
    const userProducts = allProducts.filter((p: any) => p.userId === user.id)
    setProducts(userProducts)

    // Load user's sales for analytics
    const allSales = JSON.parse(localStorage.getItem("lindabiz_sales") || "[]")
    const userSales = allSales.filter((s: any) => s.userId === user.id)
    setSales(userSales)

    // Calculate sales metrics
    const today = new Date()
    const todayStr = today.toDateString()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    const todaySalesData = userSales.filter((s: any) => new Date(s.date).toDateString() === todayStr)
    const weekSalesData = userSales.filter((s: any) => new Date(s.date) >= weekAgo)
    const monthSalesData = userSales.filter((s: any) => new Date(s.date) >= monthAgo)

    const todayTotal = todaySalesData.reduce((total: number, sale: any) => total + sale.total, 0)
    const weekTotal = weekSalesData.reduce((total: number, sale: any) => total + sale.total, 0)
    const monthTotal = monthSalesData.reduce((total: number, sale: any) => total + sale.total, 0)

    setTodaySales(todayTotal)
    setWeekSales(weekTotal)
    setMonthSales(monthTotal)

    // Calculate total stock value
    const stockValue = userProducts.reduce((total: number, product: any) => {
      return total + product.price * product.quantity
    }, 0)
    setTotalStockValue(stockValue)
  }, [user.id])

  const outOfStockItems = products.filter((product) => product.quantity === 0)
  const lowStockItems = products.filter((product) => product.quantity > 0 && product.quantity <= 5)

  // Category breakdown for general shops
  const categoryBreakdown = [
    { name: "Food", count: products.filter((p) => p.category === "Food").length, color: "bg-green-100 text-green-800" },
    {
      name: "Beverages",
      count: products.filter((p) => p.category === "Beverages").length,
      color: "bg-blue-100 text-blue-800",
    },
    {
      name: "Household",
      count: products.filter((p) => p.category === "Household").length,
      color: "bg-purple-100 text-purple-800",
    },
    {
      name: "Personal Care",
      count: products.filter((p) => p.category === "Personal Care").length,
      color: "bg-pink-100 text-pink-800",
    },
    {
      name: "Snacks",
      count: products.filter((p) => p.category === "Snacks").length,
      color: "bg-orange-100 text-orange-800",
    },
    {
      name: "Stationery",
      count: products.filter((p) => p.category === "Stationery").length,
      color: "bg-indigo-100 text-indigo-800",
    },
  ]

  const topCategories = categoryBreakdown
    .filter((cat) => cat.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-700 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {user.name}!</h2>
        <p className="text-emerald-100">Managing {user.businessName}</p>
        <div className="mt-4 flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <Package className="h-4 w-4 mr-1" />
            <span>{products.length} Products</span>
          </div>
          <div className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-1" />
            <span>{sales.length} Total Sales</span>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Total Stock Value</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">KSh {totalStockValue.toLocaleString()}</div>
            <p className="text-xs text-emerald-600">Across {products.length} products</p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Today&apos;s Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">KSh {todaySales.toLocaleString()}</div>
            <p className="text-xs text-emerald-600">
              {sales.filter((s) => new Date(s.date).toDateString() === new Date().toDateString()).length} transactions
              today
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Weekly Sales</CardTitle>
            <BarChart3 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">KSh {weekSales.toLocaleString()}</div>
            <p className="text-xs text-emerald-600">Last 7 days performance</p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">{lowStockItems.length + outOfStockItems.length}</div>
            <p className="text-xs text-emerald-600">Items need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white/70 backdrop-blur-sm border-emerald-100">
        <CardHeader>
          <CardTitle className="text-emerald-900">Quick Actions</CardTitle>
          <CardDescription className="text-emerald-700">Common tasks to manage your shop</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              className="h-20 flex flex-col items-center justify-center space-y-2 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => router.push("/products")}
            >
              <Plus className="h-6 w-6" />
              <span>Add Product</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 border-emerald-200 hover:bg-emerald-50"
              onClick={() => router.push("/sales")}
            >
              <ShoppingCart className="h-6 w-6" />
              <span>New Sale</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 border-emerald-200 hover:bg-emerald-50"
              onClick={() => router.push("/products")}
            >
              <Package className="h-6 w-6" />
              <span>Manage Stock</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Category Overview */}
      {topCategories.length > 0 && (
        <Card className="bg-white/70 backdrop-blur-sm border-emerald-100">
          <CardHeader>
            <CardTitle className="text-emerald-900">Top Product Categories</CardTitle>
            <CardDescription className="text-emerald-700">Your most stocked categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topCategories.map((category) => (
                <div key={category.name} className="p-4 border border-emerald-100 rounded-lg bg-white/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-emerald-900">{category.name}</p>
                      <p className="text-sm text-emerald-600">{category.count} products</p>
                    </div>
                    <Badge className={category.color}>{category.count}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sales Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-emerald-100">
          <CardHeader>
            <CardTitle className="text-emerald-900">Sales Performance</CardTitle>
            <CardDescription className="text-emerald-700">Revenue breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                <span className="text-emerald-800 font-medium">Monthly Sales</span>
                <span className="text-emerald-900 font-bold">KSh {monthSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-green-800 font-medium">Weekly Sales</span>
                <span className="text-green-900 font-bold">KSh {weekSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
                <span className="text-teal-800 font-medium">Daily Average</span>
                <span className="text-teal-900 font-bold">KSh {Math.round(weekSales / 7).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock Alerts */}
        <Card className="bg-white/70 backdrop-blur-sm border-emerald-100">
          <CardHeader>
            <CardTitle className="flex items-center text-emerald-900">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
              Stock Alerts
            </CardTitle>
            <CardDescription className="text-emerald-700">Items that need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            {outOfStockItems.length === 0 && lowStockItems.length === 0 ? (
              <div className="text-center py-6 text-emerald-600">
                <Package className="h-12 w-12 mx-auto mb-3 text-emerald-300" />
                <p>All stock levels are good!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {outOfStockItems.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100"
                  >
                    <div>
                      <p className="font-medium text-red-900">{item.name}</p>
                      <p className="text-sm text-red-700">
                        KSh {item.price} per {item.unit}
                      </p>
                    </div>
                    <Badge variant="destructive">Out of Stock</Badge>
                  </div>
                ))}

                {lowStockItems.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100"
                  >
                    <div>
                      <p className="font-medium text-amber-900">{item.name}</p>
                      <p className="text-sm text-amber-700">
                        KSh {item.price} per {item.unit}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                      {item.quantity} left
                    </Badge>
                  </div>
                ))}

                {outOfStockItems.length + lowStockItems.length > 4 && (
                  <Button
                    variant="ghost"
                    className="w-full mt-2 text-emerald-700 hover:bg-emerald-50"
                    onClick={() => router.push("/products")}
                  >
                    View all {outOfStockItems.length + lowStockItems.length} alerts
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Product Overview */}
      {products.length === 0 ? (
        <Card className="bg-white/70 backdrop-blur-sm border-emerald-100">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-emerald-400 mb-4" />
            <h3 className="text-lg font-semibold text-emerald-900 mb-2">No products yet</h3>
            <p className="text-emerald-700 text-center mb-4">
              Start by adding your first product to begin managing your inventory and tracking sales.
            </p>
            <Button onClick={() => router.push("/products")} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white/70 backdrop-blur-sm border-emerald-100">
          <CardHeader>
            <CardTitle className="text-emerald-900">Recent Products</CardTitle>
            <CardDescription className="text-emerald-700">Your latest inventory additions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {products.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 border border-emerald-100 rounded-lg bg-white/50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-emerald-900">{product.name}</p>
                    <p className="text-sm text-emerald-700">
                      KSh {product.price} per {product.unit} • {product.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-emerald-900">
                      {product.quantity} {product.unit}s
                    </p>
                    <Badge
                      variant={product.quantity === 0 ? "destructive" : product.quantity <= 5 ? "secondary" : "default"}
                      className={
                        product.quantity === 0
                          ? ""
                          : product.quantity <= 5
                            ? "bg-amber-100 text-amber-800 border-amber-200"
                            : "bg-emerald-100 text-emerald-800 border-emerald-200"
                      }
                    >
                      {product.quantity === 0 ? "Out of Stock" : product.quantity <= 5 ? "Low Stock" : "In Stock"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Business Tip of the Day */}
      <BusinessTip userType={user.userType} />
    </div>
  )
}
