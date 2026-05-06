"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
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
  BarChart3,
  LayoutDashboard,
} from "lucide-react"
import { useDashboard } from "@/components/dashboard/dashboard-provider"
import { useDashboardTheme } from "@/components/dashboard/dashboard-theme-provider"
import { DASHBOARD_THEMES, type DashboardThemeId, type DashboardThemeClasses } from "@/lib/dashboard-theme"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { SalesHistory } from "@/components/sales-history"
import { BusinessTip } from "@/components/business-tip"
import { DashboardPageShell } from "@/components/dashboard/page-shell"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

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

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

export default function Dashboard() {
  const { user, loading } = useDashboard()
  const { t, themeId, setThemeId } = useDashboardTheme()
  const [dashboardTab, setDashboardTab] = useState<"overview" | "analytics">("overview")
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [todaySales, setTodaySales] = useState(0)
  const [totalStockValue, setTotalStockValue] = useState(0)
  const [dataLoading, setDataLoading] = useState(true)
  const [topSold, setTopSold] = useState<{ name: string; quantitySold: number }[]>([])
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

        // Load top sold items (last 30 days)
        const topResponse = await fetch(`/api/analytics/top-products?userId=${encodeURIComponent(user.id)}&days=30&limit=8`)
        if (topResponse.ok) {
          const topData = await topResponse.json()
          const items = Array.isArray(topData?.items) ? topData.items : []
          setTopSold(items.map((it: any) => ({ name: it.name, quantitySold: Number(it.quantitySold || 0) })).filter((it: any) => it.quantitySold > 0))
        } else {
          setTopSold([])
        }

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
    window.addEventListener("inventory-refresh", handleRefresh)

    // Also refresh when localStorage changes (for real-time updates)
    window.addEventListener("storage", handleRefresh)

    return () => {
      window.removeEventListener("dashboard-refresh", handleRefresh)
      window.removeEventListener("inventory-refresh", handleRefresh)
      window.removeEventListener("storage", handleRefresh)
    }
  }, [user])

  const recentSales = useMemo(
    () => sales.filter((s) => Date.now() - new Date(s.date).getTime() <= THIRTY_DAYS_MS),
    [sales],
  )
  const revenue30 = useMemo(() => recentSales.reduce((sum, s) => sum + s.total, 0), [recentSales])
  const count30 = recentSales.length
  const avgOrder30 = count30 ? revenue30 / count30 : 0

  if (loading || !user) {
    return <DashboardSkeleton />
  }

  const outOfStockItems = products.filter((product) => product.quantity === 0)
  const lowStockItems = products.filter((product) => product.quantity > 0 && product.quantity <= 5)
  const stockAlerts = [...outOfStockItems, ...lowStockItems]

  const pieColors = t.chartPalette
  const accentColor = "emerald" as const

  return (
    <DashboardPageShell className="relative z-20">
      <Tabs
        value={dashboardTab}
        onValueChange={(v) => setDashboardTab(v as "overview" | "analytics")}
        className="space-y-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <TabsList
            className={cn(
              "grid h-auto w-full grid-cols-2 sm:inline-flex sm:w-auto sm:grid-cols-none p-1 rounded-lg",
              t.tabList,
            )}
          >
            <TabsTrigger value="overview" className={cn("gap-2 rounded-md", t.tabTrigger)}>
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className={cn("gap-2 rounded-md", t.tabTrigger)}>
              <BarChart3 className="h-4 w-4 shrink-0" />
              Analytics
            </TabsTrigger>
          </TabsList>
          <Select value={themeId} onValueChange={(v) => setThemeId(v as DashboardThemeId)}>
            <SelectTrigger className={cn("w-full sm:w-[260px]", t.selectTrigger)}>
              <SelectValue placeholder="Color theme" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(DASHBOARD_THEMES) as DashboardThemeId[]).map((id) => (
                <SelectItem key={id} value={id}>
                  {DASHBOARD_THEMES[id].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="overview" className="mt-0 space-y-8 ring-offset-0">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            t={t}
            title="Total Stock Value"
            value={`KSh ${totalStockValue.toLocaleString()}`}
            description={`Across ${products.length} products`}
            icon={<DollarSign className="h-5 w-5" />}
            accentColor={accentColor}
          />
          <StatsCard
            t={t}
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
            t={t}
            title="Products in Stock"
            value={products.filter((p) => p.quantity > 0).length.toString()}
            description={`Out of ${products.length} total products`}
            icon={<Package className="h-5 w-5" />}
            accentColor={accentColor}
          />
          <StatsCard
            t={t}
            title="Stock Alerts"
            value={stockAlerts.length.toString()}
            description={stockAlerts.length > 0 ? "Items need attention" : "All stock levels are good"}
            icon={<AlertTriangle className="h-5 w-5" />}
            accentColor={stockAlerts.length > 0 ? "amber" : accentColor}
          />
        </div>

        {/* Stock Banners */}
        {(outOfStockItems.length > 0 || lowStockItems.length > 0) && (
          <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {outOfStockItems.length > 0 && (
              <Card className="border-rose-200 bg-rose-50/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-rose-900">Out of Stock</CardTitle>
                  <CardDescription className="text-rose-700">
                    {outOfStockItems.length} item{outOfStockItems.length === 1 ? "" : "s"} need restocking.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {outOfStockItems.slice(0, 6).map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-lg border border-rose-200 bg-white/70 px-3 py-2">
                      <p className="text-sm font-medium text-rose-900">{p.name}</p>
                      <Badge variant="destructive">0</Badge>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full border-rose-200 text-rose-700 hover:bg-rose-100"
                    onClick={() => router.push("/products")}
                  >
                    Restock now
                  </Button>
                </CardContent>
              </Card>
            )}

            {lowStockItems.length > 0 && (
              <Card className="border-amber-200 bg-amber-50/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-amber-900">Low Stock</CardTitle>
                  <CardDescription className="text-amber-800">
                    {lowStockItems.length} item{lowStockItems.length === 1 ? "" : "s"} are running low.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {lowStockItems.slice(0, 6).map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-lg border border-amber-200 bg-white/70 px-3 py-2">
                      <p className="text-sm font-medium text-amber-900">{p.name}</p>
                      <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">
                        {p.quantity}
                      </Badge>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full border-amber-200 text-amber-800 hover:bg-amber-100"
                    onClick={() => router.push("/products")}
                  >
                    Review inventory
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

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
                    <ProductItem key={product.id} product={product} userType={user.userType} t={t} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card className="bg-white/80 backdrop-blur-sm border-emerald-100">
            <CardHeader>
              <CardTitle className="text-emerald-900">Comprehensive Low Stock List</CardTitle>
              <CardDescription className="text-emerald-700">
                Per product overview for all low and out-of-stock inventory items
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stockAlerts.length === 0 ? (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 text-sm text-emerald-700">
                  Great work. No low stock products at the moment.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-emerald-100">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead className="bg-emerald-50 text-emerald-900">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Product</th>
                        <th className="px-4 py-3 text-left font-semibold">Category</th>
                        <th className="px-4 py-3 text-left font-semibold">Available</th>
                        <th className="px-4 py-3 text-left font-semibold">Unit Price</th>
                        <th className="px-4 py-3 text-left font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockAlerts.map((item, index) => {
                        const out = item.quantity === 0
                        return (
                          <tr key={item.id} className={cn(index % 2 === 0 ? "bg-white" : "bg-emerald-50/30")}>
                            <td className="px-4 py-3 font-medium text-emerald-900">{item.name}</td>
                            <td className="px-4 py-3 text-emerald-700">{item.category}</td>
                            <td className="px-4 py-3 text-emerald-700">
                              {item.quantity} {item.unit}
                              {item.quantity === 1 ? "" : "s"}
                            </td>
                            <td className="px-4 py-3 text-emerald-700">KSh {item.price.toLocaleString()}</td>
                            <td className="px-4 py-3">
                              <Badge
                                variant={out ? "destructive" : "outline"}
                                className={out ? "" : "text-amber-700 border-amber-300 bg-amber-50"}
                              >
                                {out ? "Out of Stock" : "Low Stock"}
                              </Badge>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
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
              t={t}
              title="Wines"
              count={products.filter((p) => p.category?.toLowerCase() === "wine").length}
              icon={<Wine className="h-5 w-5 text-emerald-500" />}
            />
            <CategoryCard
              t={t}
              title="Spirits"
              count={products.filter((p) => p.category?.toLowerCase() === "spirits").length}
              icon={<Package className="h-5 w-5 text-emerald-500" />}
            />
            <CategoryCard
              t={t}
              title="Beers"
              count={products.filter((p) => p.category?.toLowerCase() === "beer").length}
              icon={<Beer className="h-5 w-5 text-emerald-500" />}
            />
          </div>
        )}

        {/* Business Tip of the Day */}
        <BusinessTip userType={user.userType} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-0 space-y-6 ring-offset-0">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className={cn(t.card, t.border)}>
              <CardHeader className="pb-2">
                <CardTitle className={cn("text-base font-semibold", t.cardTitle)}>30-day revenue</CardTitle>
                <CardDescription className={t.cardDesc}>Sum of all sales in the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <p className={cn("text-2xl font-bold tabular-nums", t.textStrong)}>KSh {revenue30.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className={cn(t.card, t.border)}>
              <CardHeader className="pb-2">
                <CardTitle className={cn("text-base font-semibold", t.cardTitle)}>Sales count</CardTitle>
                <CardDescription className={t.cardDesc}>Transactions in the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <p className={cn("text-2xl font-bold tabular-nums", t.textStrong)}>{count30}</p>
              </CardContent>
            </Card>
            <Card className={cn(t.card, t.border)}>
              <CardHeader className="pb-2">
                <CardTitle className={cn("text-base font-semibold", t.cardTitle)}>Avg order value</CardTitle>
                <CardDescription className={t.cardDesc}>Average per transaction (30 days)</CardDescription>
              </CardHeader>
              <CardContent>
                <p className={cn("text-2xl font-bold tabular-nums", t.textStrong)}>
                  KSh {Math.round(avgOrder30).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className={cn(t.card, t.border)}>
            <CardHeader>
              <CardTitle className={t.cardTitle}>Most sold items (last 30 days)</CardTitle>
              <CardDescription className={t.cardDesc}>
                Each item uses a different color so you can compare at a glance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topSold.length === 0 ? (
                <div className={cn("rounded-xl border p-4 text-sm", t.successBanner)}>
                  No sales data yet for this period.
                </div>
              ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="h-72 w-full min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={topSold}
                          dataKey="quantitySold"
                          nameKey="name"
                          outerRadius={100}
                          innerRadius={55}
                          paddingAngle={3}
                        >
                          {topSold.map((_, idx) => (
                            <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {topSold.map((it, idx) => {
                      const color = pieColors[idx % pieColors.length]
                      return (
                        <div
                          key={it.name}
                          className={cn(
                            "flex items-center justify-between rounded-xl border px-3 py-3 shadow-sm backdrop-blur-sm transition-opacity",
                            t.border,
                          )}
                          style={{
                            background: `linear-gradient(90deg, ${color}22 0%, transparent 65%)`,
                            borderLeftWidth: 4,
                            borderLeftColor: color,
                          }}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white shadow-inner"
                              style={{ backgroundColor: color }}
                            >
                              {idx + 1}
                            </span>
                            <p className={cn("truncate text-sm font-medium", t.textStrong)}>{it.name}</p>
                          </div>
                          <Badge variant="outline" className={cn("shrink-0 border-current tabular-nums", t.textMuted)} style={{ color }}>
                            {it.quantitySold} sold
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </DashboardPageShell>
  )
}

function StatsCard({
  t,
  title,
  value,
  description,
  icon,
  accentColor = "emerald",
}: {
  t: DashboardThemeClasses
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
    <Card className={cn(t.card, t.border)}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className={cn("p-2 rounded-full", colorMap[accentColor])}>{icon}</div>
          <div>
            <p className={cn("text-sm font-medium", t.textLabel)}>{title}</p>
            <h3 className={cn("text-2xl font-bold mt-1", t.textStrong)}>{value}</h3>
            <p className={cn("text-xs mt-1", t.textLabel)}>{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CategoryCard({
  t,
  title,
  count,
  icon,
}: {
  t: DashboardThemeClasses
  title: string
  count: number
  icon: React.ReactNode
}) {
  return (
    <Card className={cn(t.card, t.border)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className={cn("text-sm font-medium", t.textLabel)}>{title}</p>
            <h3 className={cn("text-2xl font-bold mt-1", t.textStrong)}>{count}</h3>
            <p className={cn("text-xs mt-1", t.textLabel)}>{count === 1 ? "Product" : "Products"}</p>
          </div>
          <div>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function ProductItem({
  product,
  userType,
  t,
}: {
  product: Product
  userType: "general" | "wines-spirits"
  t: DashboardThemeClasses
}) {
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
    <div
      className={cn(
        "flex items-center justify-between p-4 border rounded-lg bg-white/50 hover:opacity-95",
        t.border,
        t.id === "dark" ? "hover:bg-slate-800/40" : "hover:bg-white/80",
      )}
    >
      <div className="flex items-center space-x-3">
        <div className={cn("p-2 rounded-full", userType === "general" ? "bg-emerald-50" : "bg-green-50")}>
          {getCategoryIcon()}
        </div>
        <div>
          <p className={cn("font-medium", t.textStrong)}>{product.name}</p>
          <div className="flex items-center mt-1">
            <p className={cn("text-sm", t.textMuted)}>
              KSh {product.price} per {product.unit}
            </p>
            <Badge variant="outline" className={cn("ml-2 text-xs", t.border)}>
              {product.category}
            </Badge>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className={cn("font-medium", t.textStrong)}>
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
