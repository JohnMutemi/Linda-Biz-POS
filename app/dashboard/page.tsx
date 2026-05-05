"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Package,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  Plus,
  Wine,
  Beer,
  ArrowRight,
} from "lucide-react"
import { useDashboard } from "@/components/dashboard/dashboard-provider"
import { cn } from "@/lib/utils"
import { SalesHistory } from "@/components/sales-history"
import { BusinessTip } from "@/components/business-tip"

interface Product {
  id: string
  name: string
  price: number
  quantity: number
  unit: string
  category: string
  userType: "general" | "wines-spirits"
  userId: string
}

interface Sale {
  id: string
  items?: any[]
  total: number
  date: string
  userId: string
  itemCount?: number
}

export default function Dashboard() {
  const { user, loading } = useDashboard()
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [todaySales, setTodaySales] = useState(0)
  const [totalStockValue, setTotalStockValue] = useState(0)
  const [dataLoading, setDataLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!user) return

    // Load user's products and sales data
    const loadData = async () => {
      try {
        // Load products
        const productsResponse = await fetch(`/api/products?userId=${encodeURIComponent(user.id)}`)
        if (!productsResponse.ok) {
          throw new Error("Failed to load products")
        }
        const userProducts: Product[] = await productsResponse.json()
        setProducts(userProducts)

        // Load sales with proper item counting
        const salesResponse = await fetch(`/api/sales?userId=${encodeURIComponent(user.id)}`)
        if (!salesResponse.ok) {
          throw new Error("Failed to load sales")
        }
        const userSales: Sale[] = await salesResponse.json()
        setSales(userSales)

        // Calculate today's sales with item count
        const today = new Date().toDateString()
        const todaySalesData = userSales.filter((s: Sale) => new Date(s.date).toDateString() === today)
        const todayTotal = todaySalesData.reduce((total: number, sale: Sale) => total + sale.total, 0)
        const todayItemCount = todaySalesData.reduce((total: number, sale: Sale) => {
          // Handle both old and new sale formats
          if (sale.itemCount) {
            return total + sale.itemCount
          } else if (sale.items && Array.isArray(sale.items)) {
            return (
              total +
              sale.items.reduce((itemTotal: number, item: any) => {
                return itemTotal + (item.quantity || item.cartQuantity || 1)
              }, 0)
            )
          }
          return total
        }, 0)

        setTodaySales(todayTotal)

        // Calculate total stock value
        const stockValue = userProducts.reduce((total: number, product: Product) => {
          return total + product.price * product.quantity
        }, 0)
        setTotalStockValue(stockValue)

        console.log("Dashboard data loaded:", {
          products: userProducts.length,
          sales: userSales.length,
          todaySales: todayTotal,
          todayItems: todayItemCount,
          stockValue,
        })
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setDataLoading(false)
      }
    }

    void loadData()

    // Listen for dashboard refresh events from sales
    const handleRefresh = () => {
      console.log("Dashboard refresh triggered")
      void loadData()
    }

    window.addEventListener("dashboard-refresh", handleRefresh)

    // Also refresh when localStorage changes (for real-time updates)
    window.addEventListener("storage", handleRefresh)

    return () => {
      window.removeEventListener("dashboard-refresh", handleRefresh)
      window.removeEventListener("storage", handleRefresh)
    }
  }, [user])

  if (loading || !user) {
    return <DashboardSkeleton />
  }

  const outOfStockItems = products.filter((product) => product.quantity === 0)
  const lowStockItems = products.filter((product) => product.quantity > 0 && product.quantity <= 5)
  const stockAlerts = [...outOfStockItems, ...lowStockItems]

  const accentColor = "emerald"

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 -z-10 bg-emerald-50"></div>
      <div className="fixed inset-0 -z-10">
        <div className="absolute left-[-140px] top-[-120px] h-[340px] w-[340px] rounded-full bg-emerald-300/40 blur-3xl" />
        <div className="absolute bottom-[-100px] right-[-80px] h-[280px] w-[280px] rounded-full bg-emerald-300/40 blur-3xl" />
      </div>

      <div className="relative z-20 p-4 md:p-6 lg:p-8">
        <header className="mb-8">
          <div className="rounded-2xl border border-emerald-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm md:p-6">
            <h1 className="text-3xl font-bold tracking-tight text-emerald-900">Dashboard</h1>
            <p className="text-emerald-700 mt-1">Welcome back to {user.businessName}</p>
          </div>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Stock Value"
            value={`KSh ${totalStockValue.toLocaleString()}`}
            description={`Across ${products.length} products`}
            icon={<DollarSign className="h-5 w-5" />}
            accentColor={accentColor}
          />
          <StatsCard
            title="Today's Sales"
            value={`KSh ${todaySales.toLocaleString()}`}
            description={
              sales.length > 0
                ? `From ${sales
                    .filter((s) => new Date(s.date).toDateString() === new Date().toDateString())
                    .reduce((total, sale) => {
                      if (sale.itemCount) return total + sale.itemCount
                      if (sale.items && Array.isArray(sale.items)) {
                        return (
                          total +
                          sale.items.reduce(
                            (itemTotal: number, item: any) => itemTotal + (item.quantity || item.cartQuantity || 1),
                            0,
                          )
                        )
                      }
                      return total
                    }, 0)} items sold today`
                : "No sales today"
            }
            icon={<TrendingUp className="h-5 w-5" />}
            accentColor={accentColor}
          />
          <StatsCard
            title="Products in Stock"
            value={products.filter((p) => p.quantity > 0).length.toString()}
            description={`Out of ${products.length} total products`}
            icon={<Package className="h-5 w-5" />}
            accentColor={accentColor}
          />
          <StatsCard
            title="Stock Alerts"
            value={stockAlerts.length.toString()}
            description={stockAlerts.length > 0 ? "Items need attention" : "All stock levels are good"}
            icon={<AlertTriangle className="h-5 w-5" />}
            accentColor={stockAlerts.length > 0 ? "amber" : accentColor}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-2 bg-white/70 backdrop-blur-sm border-emerald-100">
            <CardHeader>
              <CardTitle className="text-emerald-900">Quick Actions</CardTitle>
              <CardDescription className="text-emerald-700">Common tasks for your business</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  className="relative z-10 h-24 space-y-2 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => router.push("/products")}
                >
                  <Plus className="h-6 w-6" />
                  <span>Add Product</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center space-y-2 border-emerald-200 hover:bg-emerald-50 relative z-10"
                  onClick={() => router.push("/sales")}
                >
                  <ShoppingCart className="h-6 w-6" />
                  <span>New Sale</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center space-y-2 border-emerald-200 hover:bg-emerald-50 relative z-10"
                  onClick={() => router.push("/products")}
                >
                  <Package className="h-6 w-6" />
                  <span>Manage Stock</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stock Alerts Summary */}
          <Card className="bg-white/70 backdrop-blur-sm border-emerald-100">
            <CardHeader>
              <CardTitle className="flex items-center text-emerald-900">
                <AlertTriangle
                  className={cn("h-5 w-5 mr-2", stockAlerts.length > 0 ? "text-amber-500" : "text-gray-400")}
                />
                Stock Alerts
              </CardTitle>
              <CardDescription className="text-emerald-700">
                {stockAlerts.length > 0 ? `${stockAlerts.length} items need attention` : "All stock levels are good"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stockAlerts.length === 0 ? (
                <div className="text-center py-6 text-emerald-600">
                  <Package className="h-12 w-12 mx-auto mb-3 text-emerald-300" />
                  <p>No stock alerts at the moment</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {outOfStockItems.slice(0, 2).map((item) => (
                    <div key={item.id} className="p-3 bg-red-50 rounded-lg border border-red-100">
                      <div className="flex justify-between items-center">
                        <p className="font-medium">{item.name}</p>
                        <Badge variant="destructive">Out of Stock</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        KSh {item.price} per {item.unit}
                      </p>
                    </div>
                  ))}

                  {lowStockItems.slice(0, 2).map((item) => (
                    <div key={item.id} className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <div className="flex justify-between items-center">
                        <p className="font-medium">{item.name}</p>
                        <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                          {item.quantity} left
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        KSh {item.price} per {item.unit}
                      </p>
                    </div>
                  ))}

                  {stockAlerts.length > 4 && (
                    <Button
                      variant="ghost"
                      className="w-full mt-2 relative z-10"
                      onClick={() => router.push("/products")}
                    >
                      View all {stockAlerts.length} alerts
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Product Overview */}
        <div className="mt-6">
          <Card className="bg-white/70 backdrop-blur-sm border-emerald-100">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-emerald-900">Product Overview</CardTitle>
                <CardDescription className="text-emerald-700">
                  {products.length > 0
                    ? `Showing ${Math.min(5, products.length)} of ${products.length} products`
                    : "No products added yet"}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/products")}
                className="border-emerald-200 hover:bg-emerald-50 relative z-10"
              >
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto mb-4 text-emerald-300" />
                  <h3 className="text-lg font-medium text-emerald-900 mb-2">No products yet</h3>
                  <p className="text-emerald-700 max-w-md mx-auto mb-6">
                    Start by adding your first product to begin managing your inventory and tracking sales.
                  </p>
                  <Button
                    onClick={() => router.push("/products")}
                    className="bg-emerald-600 hover:bg-emerald-700 relative z-10"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Product
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {products.slice(0, 5).map((product) => (
                    <ProductItem key={product.id} product={product} userType={user.userType} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sales History */}
        <div className="mt-6">
          <SalesHistory userId={user.id} limit={5} />
        </div>

        {/* Category Overview for Wines & Spirits */}
        {user.userType === "wines-spirits" && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <CategoryCard
              title="Wines"
              count={products.filter((p) => p.category?.toLowerCase() === "wine").length}
              icon={<Wine className="h-5 w-5 text-emerald-500" />}
            />
            <CategoryCard
              title="Spirits"
              count={products.filter((p) => p.category?.toLowerCase() === "spirits").length}
              icon={<Package className="h-5 w-5 text-emerald-500" />}
            />
            <CategoryCard
              title="Beers"
              count={products.filter((p) => p.category?.toLowerCase() === "beer").length}
              icon={<Beer className="h-5 w-5 text-emerald-500" />}
            />
          </div>
        )}

        {/* Business Tip of the Day */}
        <BusinessTip userType={user.userType} />
      </div>
    </div>
  )
}

function StatsCard({
  title,
  value,
  description,
  icon,
  accentColor = "emerald",
}: {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  accentColor?: "emerald" | "green" | "amber"
}) {
  const colorMap = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    green: "bg-green-50 text-green-700 border-green-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
  }

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-emerald-100">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className={cn("p-2 rounded-full", colorMap[accentColor])}>{icon}</div>
          <div>
            <p className="text-sm font-medium text-emerald-600">{title}</p>
            <h3 className="text-2xl font-bold mt-1 text-emerald-900">{value}</h3>
            <p className="text-xs text-emerald-600 mt-1">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CategoryCard({ title, count, icon }: { title: string; count: number; icon: React.ReactNode }) {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-emerald-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600">{title}</p>
            <h3 className="text-2xl font-bold mt-1 text-emerald-900">{count}</h3>
            <p className="text-xs text-emerald-600 mt-1">{count === 1 ? "Product" : "Products"}</p>
          </div>
          <div>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function ProductItem({ product, userType }: { product: Product; userType: "general" | "wines-spirits" }) {
  const getStockStatus = () => {
    if (product.quantity === 0) {
      return { label: "Out of Stock", variant: "destructive" as const }
    } else if (product.quantity <= 5) {
      return {
        label: "Low Stock",
        variant: "outline" as const,
        className: "text-amber-600 border-amber-300 bg-amber-50",
      }
    } else {
      return { label: "In Stock", variant: "default" as const }
    }
  }

  const status = getStockStatus()

  const getCategoryIcon = () => {
    switch (product.category?.toLowerCase()) {
      case "wine":
        return <Wine className="h-4 w-4 text-emerald-500" />
      case "spirits":
        return <Package className="h-4 w-4 text-emerald-500" />
      case "beer":
        return <Beer className="h-4 w-4 text-emerald-500" />
      default:
        return <Package className="h-4 w-4 text-emerald-500" />
    }
  }

  return (
    <div className="flex items-center justify-between p-4 border border-emerald-100 rounded-lg hover:bg-emerald-50/50 bg-white/50">
      <div className="flex items-center space-x-3">
        <div className={cn("p-2 rounded-full", userType === "general" ? "bg-emerald-50" : "bg-green-50")}>
          {getCategoryIcon()}
        </div>
        <div>
          <p className="font-medium text-emerald-900">{product.name}</p>
          <div className="flex items-center mt-1">
            <p className="text-sm text-emerald-700">
              KSh {product.price} per {product.unit}
            </p>
            <Badge variant="outline" className="ml-2 text-xs border-emerald-200">
              {product.category}
            </Badge>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-emerald-900">
          {product.quantity} {product.unit}s
        </p>
        <Badge variant={status.variant} className={status.className}>
          {status.label}
        </Badge>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-white/70">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-white/70">
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70">
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
