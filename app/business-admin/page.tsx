"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { Activity, BarChart3, Boxes, CalendarRange, Download, Lightbulb, RefreshCw, Sparkles, Zap } from "lucide-react"
import { isLowStock, isOutOfStock } from "@/lib/inventory-stock"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

type OverviewData = {
  period: { from: string; to: string }
  metrics: {
    totalProducts: number
    totalStockValue: number
    lowStockProducts: number
    outOfStockProducts: number
    revenue: number
    salesCount: number
    todayRevenue: number
    todaySalesCount: number
    averageOrderValue: number
    overallHealthScore: number
  }
  trends: {
    dailyRevenue: { date: string; revenue: number; salesCount: number; anomaly: boolean }[]
  }
  topProducts: { id: string; name: string; quantitySold: number; revenue: number }[]
  actions: { created: number; edited: number; deleted: number; all: number }
  tips: string[]
}

type SellerProduct = {
  id: string
  name: string
  category: string
  quantity: number
  reorderLevel?: number
}

function isoDateDaysAgo(days: number) {
  const d = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return d.toISOString().slice(0, 10)
}

function localDateKey(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export default function BusinessAdminPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [from, setFrom] = useState(isoDateDaysAgo(6))
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10))
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<OverviewData | null>(null)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null)
  const [sellerProducts, setSellerProducts] = useState<SellerProduct[]>([])

  const activeTab = ((searchParams.get("tab") || "overview").toLowerCase() as "overview" | "products" | "actions" | "tips") ?? "overview"
  const stockFilter = ((searchParams.get("stock") || "all").toLowerCase() as "all" | "low" | "out") ?? "all"

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ from, to })
      const response = await fetch(`/api/business-admin/overview?${params.toString()}`, { cache: "no-store" })
      if (!response.ok) throw new Error("Failed to load admin overview")
      const payload = (await response.json()) as OverviewData
      setData(payload)
      setLastUpdatedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
    } finally {
      setLoading(false)
    }
  }, [from, to])

  const loadSellerProducts = useCallback(async () => {
    const sessionResponse = await fetch("/api/auth/session", { cache: "no-store" })
    if (!sessionResponse.ok) return
    const session = await sessionResponse.json()
    if (!session?.id) return
    const productsResponse = await fetch(`/api/products?userId=${encodeURIComponent(String(session.id))}`, { cache: "no-store" })
    if (!productsResponse.ok) return
    const products = (await productsResponse.json()) as SellerProduct[]
    setSellerProducts(Array.isArray(products) ? products : [])
  }, [])

  const refreshAll = useCallback(async () => {
    await Promise.all([loadData(), loadSellerProducts()])
  }, [loadData, loadSellerProducts])

  useEffect(() => {
    void refreshAll()
  }, [refreshAll])

  const todayIso = useMemo(() => localDateKey(new Date()), [])
  const today = useMemo(() => {
    const row = (data?.trends?.dailyRevenue || []).find((d) => d.date === todayIso)
    const apiTodayRevenue = Number(data?.metrics?.todayRevenue ?? 0)
    const apiTodaySalesCount = Number(data?.metrics?.todaySalesCount ?? 0)
    if (apiTodayRevenue > 0 || apiTodaySalesCount > 0) {
      return {
        revenue: apiTodayRevenue,
        salesCount: apiTodaySalesCount,
        hasData: true,
      }
    }
    return {
      revenue: row?.revenue ?? 0,
      salesCount: row?.salesCount ?? 0,
      hasData: Boolean(row && (row.revenue > 0 || row.salesCount > 0)),
    }
  }, [data, todayIso])

  const hasRangeData = Boolean((data?.trends?.dailyRevenue || []).some((d) => d.revenue > 0 || d.salesCount > 0))
  const salesDays = useMemo(
    () => [...(data?.trends?.dailyRevenue || [])].sort((a, b) => b.date.localeCompare(a.date)),
    [data?.trends?.dailyRevenue],
  )
  const stockCounts = useMemo(() => {
    const out = sellerProducts.filter((p) => isOutOfStock(p)).length
    const low = sellerProducts.filter((p) => isLowStock(p)).length
    return { low, out }
  }, [sellerProducts])

  const stockAlerts = useMemo(() => {
    return sellerProducts
      .filter((product) => isLowStock(product) || isOutOfStock(product))
      .sort((a, b) => Number(a.quantity) - Number(b.quantity))
      .map((product) => ({
        ...product,
        reorderLevel: Number(product.reorderLevel ?? 5),
        status: isOutOfStock(product) ? ("out" as const) : ("low" as const),
      }))
  }, [sellerProducts])
  const filteredStockAlerts = useMemo(() => {
    const source = stockAlerts
    if (stockFilter === "all") return source
    return source.filter((item) => item.status === stockFilter)
  }, [stockAlerts, stockFilter])

  const setTab = (tab: "overview" | "products" | "actions" | "tips") => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    router.replace(`/business-admin?${params.toString()}`)
  }
  const setStockTab = (stock: "all" | "low" | "out") => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", "products")
    params.set("stock", stock)
    router.replace(`/business-admin?${params.toString()}`)
  }

  return (
    <div className="relative z-20 mx-auto w-full max-w-7xl safe-pad-x pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-4 sm:pb-10 sm:pt-6">
      <Tabs value={activeTab} onValueChange={(v) => setTab(v as any)} className="space-y-6">
        <div
          className={cn(
            "sticky z-50 space-y-3 pb-3",
            "top-[calc(max(4rem,env(safe-area-inset-top))+3.25rem)] lg:top-0",
            "bg-gradient-to-b from-emerald-50/98 via-green-50/95 to-teal-50/90 backdrop-blur-md",
          )}
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/50 bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-600 p-5 text-white shadow-[0_18px_60px_-25px_rgba(2,132,199,0.7)] sm:p-7">
            <div className="absolute inset-0 opacity-40">
              <div className="absolute -left-24 -top-24 h-56 w-56 rounded-full bg-white/35 blur-3xl" />
              <div className="absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-white/25 blur-3xl" />
            </div>
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide">
                  <Sparkles className="h-3.5 w-3.5" />
                  Owner Admin
                </div>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Overview & Insights</h1>
                <p className="mt-1 max-w-2xl text-sm text-white/85">
                  Track revenue trends, stock value, health score, and fast-moving products—then export reports for any date range.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="bg-white/90 text-emerald-900 hover:bg-white"
                  disabled={loading}
                  onClick={() => void refreshAll()}
                >
                  <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
                  Refresh data
                </Button>
                <Badge className={loading ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-900"}>
                  {loading ? "Updating…" : "Ready"}
                </Badge>
                {lastUpdatedAt ? (
                  <Badge className="bg-white/15 text-white">Last updated: {lastUpdatedAt}</Badge>
                ) : null}
                <Badge className="bg-white/15 text-white">
                  <BarChart3 className="mr-1.5 inline h-3.5 w-3.5" />
                  {data?.period?.from ?? from} → {data?.period?.to ?? to}
                </Badge>
              </div>
            </div>
          </div>

          <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-2xl border border-emerald-100 bg-white/90 p-1 shadow-sm backdrop-blur-sm">
              <TabsTrigger
                value="overview"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-emerald-800 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="products"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-emerald-800 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                Products
              </TabsTrigger>
              <TabsTrigger
                value="actions"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-emerald-800 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                Actions
              </TabsTrigger>
              <TabsTrigger
                value="tips"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-emerald-800 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                Tips
              </TabsTrigger>
            </TabsList>
        </div>

        <div className="rounded-2xl border border-white/40 bg-white/55 shadow-[0_10px_35px_-20px_rgba(16,185,129,0.45)] ring-1 ring-emerald-100/60 backdrop-blur-xl sm:rounded-3xl">
          <div className="space-y-6 p-3 sm:p-6 lg:p-8">
          <TabsContent value="overview" className="mt-0 space-y-6">
            <Card className="border-emerald-100 bg-white/70 backdrop-blur-sm">
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <CardTitle className="flex items-center gap-2 text-emerald-950">
                    <Zap className="h-5 w-5 text-emerald-700" />
                    Today snapshot
                  </CardTitle>
                  <CardDescription className="text-emerald-700">A quick view of how today is going.</CardDescription>
                </div>
                <Badge className="w-fit bg-emerald-100 text-emerald-900">Today</Badge>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TapKpiCard
                    title="Today revenue"
                    value={`KSh ${Math.round(today.revenue).toLocaleString()}`}
                    sub={today.hasData ? `${today.salesCount} sale(s) today` : "No sales recorded today"}
                    icon={<BarChart3 className="h-5 w-5" />}
                    tone="emerald"
                  />
                  <TapKpiCard
                    title="Stock attention"
                    value={`${stockCounts.low} low • ${stockCounts.out} out`}
                    sub="From seller inventory (same rules as Products page)"
                    icon={<Activity className="h-5 w-5" />}
                    tone={stockCounts.out > 0 ? "rose" : "sky"}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setStockTab("out")}
                    className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-rose-700 hover:bg-rose-100"
                  >
                    View out-of-stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockTab("low")}
                    className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700 hover:bg-amber-100"
                  >
                    View low-stock
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 bg-white/70 backdrop-blur-sm">
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <CardTitle className="flex items-center gap-2 text-emerald-950">
                    <CalendarRange className="h-5 w-5 text-emerald-700" />
                    Reports Range
                  </CardTitle>
                  <CardDescription className="text-emerald-700">Daily by default, or set a custom range.</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-emerald-200 bg-white/60 hover:bg-emerald-50"
                    onClick={() => {
                      const params = new URLSearchParams({ from, to })
                      window.location.href = `/api/business-admin/exports/sales/csv?${params.toString()}`
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-emerald-200 bg-white/60 hover:bg-emerald-50"
                    onClick={() => {
                      const params = new URLSearchParams({ from, to })
                      window.location.href = `/api/business-admin/exports/sales/pdf?${params.toString()}`
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="w-full sm:w-auto">
                  <p className="mb-1 text-xs font-medium text-emerald-700">From</p>
                  <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="bg-white/70" />
                </div>
                <div className="w-full sm:w-auto">
                  <p className="mb-1 text-xs font-medium text-emerald-700">To</p>
                  <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="bg-white/70" />
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => void loadData()}>
                  Apply Range
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-emerald-200 bg-white/60 hover:bg-emerald-50"
                  disabled={loading}
                  onClick={() => void refreshAll()}
                >
                  <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
                  Refresh
                </Button>
              </CardContent>
            </Card>

            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <TapKpiCard
                title="Range revenue"
                value={`KSh ${Math.round(data?.metrics.revenue || 0).toLocaleString()}`}
                sub="Selected date range"
                icon={<BarChart3 className="h-5 w-5" />}
                tone="emerald"
              />
              <TapKpiCard
                title="Sales count"
                value={`${data?.metrics.salesCount || 0}`}
                sub="Transactions in range"
                icon={<Activity className="h-5 w-5" />}
                tone="sky"
              />
              <TapKpiCard
                title="Stock value"
                value={`KSh ${Math.round(data?.metrics.totalStockValue || 0).toLocaleString()}`}
                sub="Inventory value estimate"
                icon={<Boxes className="h-5 w-5" />}
                tone="violet"
              />
              <TapKpiCard
                title="Health score"
                value={`${data?.metrics.overallHealthScore || 0}%`}
                sub="System health indicator"
                icon={<Sparkles className="h-5 w-5" />}
                tone="amber"
              />
            </div>

            <Card className="border-emerald-100 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-emerald-950">Revenue trend</CardTitle>
                <CardDescription className="text-emerald-700">
                  Daily revenue for the selected range. Red dots are anomalies (≥ 2σ from the mean, when there are at least 5 days of data).
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!loading && !hasRangeData ? (
                  <EmptyState
                    title="No revenue data in this range"
                    description="Try adjusting the date range, or make a few sales to start seeing trends."
                    icon={<BarChart3 className="h-5 w-5" />}
                  />
                ) : (
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data?.trends?.dailyRevenue || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#059669"
                        strokeWidth={2}
                        dot={(props: any) => {
                          const anomaly = Boolean(props?.payload?.anomaly)
                          const key = `${props?.payload?.date ?? ""}-${props?.cx ?? ""}-${props?.cy ?? ""}`
                          return (
                            <circle
                              key={key}
                              cx={props.cx}
                              cy={props.cy}
                              r={3.5}
                              fill={anomaly ? "#ef4444" : "#059669"}
                              stroke="#ffffff"
                              strokeWidth={1.5}
                            />
                          )
                        }}
                      />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-emerald-100 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-emerald-950">Sales by day</CardTitle>
                <CardDescription className="text-emerald-700">Paginated list (5 rows per page).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {salesDays.map((row) => (
                  <div key={row.date} className="rounded-xl border border-emerald-100 bg-white/70 p-3 text-sm">
                    <p className="font-medium text-emerald-900">{row.date}</p>
                    <p className="text-emerald-700">
                      KSh {Math.round(row.revenue).toLocaleString()} • {row.salesCount} sale(s)
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="mt-0 space-y-6">
            <Card className="border-emerald-100 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-emerald-950">Fast Moving Products</CardTitle>
                <CardDescription className="text-emerald-700">Top sellers in selected range.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {loading ? (
                  <EmptyState
                    title="Loading products insights…"
                    description="Crunching sales by product."
                    icon={<Boxes className="h-5 w-5" />}
                    variant="loading"
                  />
                ) : null}
                {(data?.topProducts || []).map((item) => (
                  <div key={item.id} className="rounded-xl border border-emerald-100 bg-white/60 p-3">
                    <p className="font-medium text-emerald-950">{item.name}</p>
                    <p className="text-sm text-emerald-700">
                      {item.quantitySold} units sold • KSh {Math.round(item.revenue).toLocaleString()}
                    </p>
                  </div>
                ))}
                {!loading && (!data?.topProducts || data.topProducts.length === 0) ? (
                  <EmptyState
                    title="No product sales in this range"
                    description="When sales happen, your top products will show up here."
                    icon={<Boxes className="h-5 w-5" />}
                  />
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-emerald-100 bg-white/70 backdrop-blur-sm">
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-emerald-950">Low / Out-of-stock products</CardTitle>
                  <CardDescription className="text-emerald-700">Showing 5 items per page.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant={stockFilter === "all" ? "default" : "outline"} className={stockFilter === "all" ? "bg-emerald-600 hover:bg-emerald-700" : "border-emerald-200"} onClick={() => setStockTab("all")}>All</Button>
                  <Button variant={stockFilter === "low" ? "default" : "outline"} className={stockFilter === "low" ? "bg-amber-600 hover:bg-amber-700" : "border-emerald-200"} onClick={() => setStockTab("low")}>Low</Button>
                  <Button variant={stockFilter === "out" ? "default" : "outline"} className={stockFilter === "out" ? "bg-rose-600 hover:bg-rose-700" : "border-emerald-200"} onClick={() => setStockTab("out")}>Out</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {filteredStockAlerts.map((item) => (
                  <div key={item.id} className="rounded-xl border border-emerald-100 bg-white/70 p-3">
                    <p className="font-medium text-emerald-950">{item.name}</p>
                    <p className="text-sm text-emerald-700">
                      {item.category} • Qty: {item.quantity} • Reorder: {item.reorderLevel}
                    </p>
                  </div>
                ))}
                {!loading && filteredStockAlerts.length === 0 ? (
                  <EmptyState
                    title="No stock alerts for this filter"
                    description="Try another filter or continue monitoring inventory."
                    icon={<Boxes className="h-5 w-5" />}
                  />
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="mt-0 space-y-6">
            <Card className="border-emerald-100 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-emerald-950">Business Actions Summary</CardTitle>
                <CardDescription className="text-emerald-700">Key activity tracked on this account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-emerald-800">
                {loading ? (
                  <EmptyState
                    title="Loading actions…"
                    description="Collecting activity logs."
                    icon={<Activity className="h-5 w-5" />}
                    variant="loading"
                  />
                ) : null}

                {!loading && (data?.actions.all || 0) === 0 ? (
                  <EmptyState
                    title="No actions recorded in this range"
                    description="Create/edit products and the activity summary will appear here."
                    icon={<Activity className="h-5 w-5" />}
                  />
                ) : null}

                {!loading && (data?.actions.all || 0) > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-emerald-100 bg-white/60 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Product activity</p>
                      <div className="mt-2 space-y-1">
                        <p>Created: {data?.actions.created || 0}</p>
                        <p>Edited: {data?.actions.edited || 0}</p>
                        <p>Deleted: {data?.actions.deleted || 0}</p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-emerald-100 bg-white/60 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Stock status</p>
                      <div className="mt-2 space-y-1">
                        <p>Low stock products: {stockCounts.low}</p>
                        <p>Out of stock products: {stockCounts.out}</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tips" className="mt-0 space-y-6">
            <Card className="border-emerald-100 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-emerald-950">Business Tips</CardTitle>
                <CardDescription className="text-emerald-700">System-generated recommendations from current performance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {loading ? (
                  <EmptyState
                    title="Generating tips…"
                    description="Analyzing current performance."
                    icon={<Lightbulb className="h-5 w-5" />}
                    variant="loading"
                  />
                ) : null}
                {(data?.tips || []).map((tip, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-sky-50 p-3 text-sm text-emerald-950"
                  >
                    {tip}
                  </div>
                ))}
                {!loading && (!data?.tips || data.tips.length === 0) ? (
                  <EmptyState
                    title="No tips yet"
                    description="When there’s enough activity, we’ll surface useful suggestions here."
                    icon={<Lightbulb className="h-5 w-5" />}
                  />
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  )
}

function TapKpiCard({
  title,
  value,
  sub,
  icon,
  tone = "emerald",
}: {
  title: string
  value: string
  sub: string
  icon: React.ReactNode
  tone?: "emerald" | "sky" | "violet" | "amber" | "rose"
}) {
  const toneStyles: Record<string, { ring: string; chip: string; glow: string }> = {
    emerald: {
      ring: "ring-emerald-100/70",
      chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
      glow: "shadow-[0_18px_50px_-30px_rgba(16,185,129,0.55)]",
    },
    sky: {
      ring: "ring-sky-100/70",
      chip: "bg-sky-50 text-sky-700 border-sky-200",
      glow: "shadow-[0_18px_50px_-30px_rgba(14,165,233,0.55)]",
    },
    violet: {
      ring: "ring-violet-100/70",
      chip: "bg-violet-50 text-violet-700 border-violet-200",
      glow: "shadow-[0_18px_50px_-30px_rgba(139,92,246,0.55)]",
    },
    amber: {
      ring: "ring-amber-100/70",
      chip: "bg-amber-50 text-amber-800 border-amber-200",
      glow: "shadow-[0_18px_50px_-30px_rgba(245,158,11,0.5)]",
    },
    rose: {
      ring: "ring-rose-100/70",
      chip: "bg-rose-50 text-rose-700 border-rose-200",
      glow: "shadow-[0_18px_50px_-30px_rgba(244,63,94,0.45)]",
    },
  }
  const t = toneStyles[tone] ?? toneStyles.emerald

  return (
    <button
      type="button"
      className={cn(
        "w-full rounded-2xl border border-emerald-100 bg-white/70 p-4 text-left backdrop-blur-sm transition active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60",
        "ring-1",
        t.ring,
        t.glow,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">{title}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-emerald-950 tabular-nums">{value}</p>
          <p className="mt-1 text-sm text-emerald-700">{sub}</p>
        </div>
        <span className={cn("inline-flex shrink-0 items-center justify-center rounded-xl border px-3 py-2", t.chip)}>{icon}</span>
      </div>
    </button>
  )
}

function EmptyState({
  title,
  description,
  icon,
  variant = "empty",
}: {
  title: string
  description: string
  icon: React.ReactNode
  variant?: "empty" | "loading"
}) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white/70 via-emerald-50/40 to-sky-50/40 p-5 text-emerald-950 shadow-sm ring-1 ring-white/40 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-white/70 text-emerald-700",
            variant === "loading" && "animate-pulse",
          )}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-sm text-emerald-700">{description}</p>
        </div>
      </div>
    </div>
  )
}
