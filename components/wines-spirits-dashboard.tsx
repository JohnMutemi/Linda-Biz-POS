"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wine, DollarSign, ShoppingCart, AlertTriangle, TrendingUp, Plus, Beer, BoxIcon as Bottle } from "lucide-react"
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

interface WineSpiritsProduct {
  id: string
  name: string
  price: number
  quantity: number
  unit: string
  category: string
  userType: "general" | "wines-spirits"
  userId: string
}

interface WinesSpiritssDashboardProps {
  user: User
}

export function WinesSpiritssDashboard({ user }: WinesSpiritssDashboardProps) {
  const [products, setProducts] = useState<WineSpiritsProduct[]>([])
  const [todaySales, setTodaySales] = useState(0)
  const [totalStockValue, setTotalStockValue] = useState(0)
  const router = useRouter()

  useEffect(() => {
    // Load user's products from localStorage
    const allProducts = JSON.parse(localStorage.getItem("lindabiz_products") || "[]")
    const userProducts = allProducts.filter((p: any) => p.userId === user.id)
    setProducts(userProducts)

    // Load user's sales for today's sales calculation
    const allSales = JSON.parse(localStorage.getItem("lindabiz_sales") || "[]")
    const userSales = allSales.filter((s: any) => s.userId === user.id)
    const today = new Date().toDateString()
    const todaySalesData = userSales.filter((s: any) => new Date(s.date).toDateString() === today)
    const todayTotal = todaySalesData.reduce((total: number, sale: any) => total + sale.total, 0)
    setTodaySales(todayTotal)

    // Calculate total stock value
    const stockValue = userProducts.reduce((total: number, product: any) => {
      return total + product.price * product.quantity
    }, 0)
    setTotalStockValue(stockValue)
  }, [user.id])

  const outOfStockItems = products.filter((product) => product.quantity === 0)
  const lowStockItems = products.filter((product) => product.quantity > 0 && product.quantity <= 5)

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "wine":
        return Wine
      case "spirits":
        return Bottle
      case "beer":
        return Beer
      default:
        return Wine
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "wine":
        return "text-purple-600"
      case "spirits":
        return "text-amber-600"
      case "beer":
        return "text-yellow-600"
      default:
        return "text-purple-600"
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {user.name}!</h2>
        <p className="text-purple-100">Managing {user.businessName}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSh {totalStockValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across {products.length} products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSh {todaySales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+18% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products in Stock</CardTitle>
            <Wine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter((p) => p.quantity > 0).length}</div>
            <p className="text-xs text-muted-foreground">Out of {products.length} total products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockItems.length + outOfStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Items need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for your wines & spirits business</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              className="h-20 flex flex-col items-center justify-center space-y-2 bg-purple-600 hover:bg-purple-700"
              onClick={() => router.push("/products")}
            >
              <Plus className="h-6 w-6" />
              <span>Add Product</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => router.push("/sales")}
            >
              <ShoppingCart className="h-6 w-6" />
              <span>New Sale</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => router.push("/products")}
            >
              <Wine className="h-6 w-6" />
              <span>Manage Stock</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Product Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wines</CardTitle>
            <Wine className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter((p) => p.category?.toLowerCase() === "wine").length}
            </div>
            <p className="text-xs text-muted-foreground">Wine varieties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spirits</CardTitle>
            <Bottle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter((p) => p.category?.toLowerCase() === "spirits").length}
            </div>
            <p className="text-xs text-muted-foreground">Spirit brands</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beers</CardTitle>
            <Beer className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter((p) => p.category?.toLowerCase() === "beer").length}
            </div>
            <p className="text-xs text-muted-foreground">Beer brands</p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Alerts */}
      {(outOfStockItems.length > 0 || lowStockItems.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span>Stock Alerts</span>
            </CardTitle>
            <CardDescription>Items that need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {outOfStockItems.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-600 mb-2">Out of Stock</h4>
                  <div className="space-y-2">
                    {outOfStockItems.map((item) => {
                      const Icon = getCategoryIcon(item.category || "wine")
                      return (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Icon className={`h-5 w-5 ${getCategoryColor(item.category || "wine")}`} />
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-600">
                                KSh {item.price} per {item.unit || "bottle"}
                              </p>
                            </div>
                          </div>
                          <Badge variant="destructive">Out of Stock</Badge>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {lowStockItems.length > 0 && (
                <div>
                  <h4 className="font-medium text-orange-600 mb-2">Low Stock</h4>
                  <div className="space-y-2">
                    {lowStockItems.map((item) => {
                      const Icon = getCategoryIcon(item.category || "wine")
                      return (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Icon className={`h-5 w-5 ${getCategoryColor(item.category || "wine")}`} />
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-600">
                                KSh {item.price} per {item.unit || "bottle"}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary">{item.quantity} left</Badge>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Inventory */}
      {products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wine className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-600 text-center mb-4">
              Start by adding your first wine, spirit, or beer product to begin managing your inventory and tracking
              sales.
            </p>
            <Button onClick={() => router.push("/products")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Product Inventory</CardTitle>
            <CardDescription>Your current wines & spirits stock</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {products.map((product) => {
                const Icon = getCategoryIcon(product.category || "wine")
                return (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3 flex-1">
                      <Icon className={`h-6 w-6 ${getCategoryColor(product.category || "wine")}`} />
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">
                          KSh {product.price} per {product.unit || "bottle"}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {product.category || "wine"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {product.quantity} {product.unit || "bottles"}
                      </p>
                      <Badge
                        variant={
                          product.quantity === 0 ? "destructive" : product.quantity <= 5 ? "secondary" : "default"
                        }
                      >
                        {product.quantity === 0 ? "Out of Stock" : product.quantity <= 5 ? "Low Stock" : "In Stock"}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Business Tip of the Day */}
      <BusinessTip userType={user.userType} />
    </div>
  )
}
