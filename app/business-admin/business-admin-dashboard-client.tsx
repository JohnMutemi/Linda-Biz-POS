"use client"

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { Activity, BarChart3, Boxes, CalendarRange, Download, Lightbulb, RefreshCw, Sparkles, Zap } from "lucide-react"
import { isLowStock, isOutOfStock } from "@/lib/inventory-stock"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { OwnerAdminInventoryPanel } from "@/components/business-admin/owner-admin-inventory-panel"
import { businessAdminTheme as ba } from "@/lib/business-admin-theme"
import { OwnerAdminTabIntro, OwnerAdminTabStrip } from "@/components/dashboard/owner-admin-tab-strip"

const MAIN_TABS = [
  { value: "overview", label: "Overview" },
  { value: "inventory", label: "Inventory" },
  { value: "actions", label: "Actions" },
  { value: "tips", label: "Tips" },
] as const

const INVENTORY_SUB_TABS = [
  { value: "manage", label: "Management", shortLabel: "Manage" },
  { value: "fast-moving", label: "Fast moving", shortLabel: "Fast" },
  { value: "stock-alerts", label: "Low & out of stock", shortLabel: "Alerts" },
] as const

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

export function BusinessAdminDashboardClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [from, setFrom] = useState(isoDateDaysAgo(6))
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10))
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<OverviewData | null>(null)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null)
  const [sellerProducts, setSellerProducts] = useState<SellerProduct[]>([])

  const tabParam = (searchParams.get("tab") || "overview").toLowerCase()
  const activeTab = (
    tabParam === "products" ? "inventory" : tabParam
  ) as "overview" | "inventory" | "actions" | "tips"
  const stockFilter = ((searchParams.get("stock") || "all").toLowerCase() as "all" | "low" | "out") ?? "all"
  const inventoryViewParam = (searchParams.get("view") || "manage").toLowerCase()
  const inventoryView = (
    inventoryViewParam === "fast-moving" || inventoryViewParam === "fast"
      ? "fast-moving"
      : inventoryViewParam === "stock-alerts" || inventoryViewParam === "stock" || inventoryViewParam === "alerts"
        ? "stock-alerts"
        : "manage"
  ) as "manage" | "fast-moving" | "stock-alerts"

  const adminCardClass = ba.card
  const adminCardTitleClass = ba.cardTitle

  const heroMeta = useMemo(
    () =>
      ({
        overview: {
          title: "Overview & Insights",
          description:
            "Track revenue trends, stock value, health score, and fast-moving products—then export reports for any date range.",
        },
        inventory: {
          title: "Inventory",
          description: "Manage products, review fast movers, and resolve low or out-of-stock items.",
        },
        actions: {
          title: "Business actions",
          description: "See product and inventory activity logged for this business.",
        },
        tips: {
          title: "Business tips",
          description: "System-generated recommendations based on your latest performance.",
        },
      }) as const,
    [],
  )
  const hero = heroMeta[activeTab] ?? heroMeta.overview

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

  useEffect(() => {
    const onInventoryRefresh = () => {
      void loadSellerProducts()
      void loadData()
    }
    window.addEventListener("inventory-refresh", onInventoryRefresh)
    return () => window.removeEventListener("inventory-refresh", onInventoryRefresh)
  }, [loadSellerProducts, loadData])

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

  const setTab = (tab: "overview" | "inventory" | "actions" | "tips") => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    if (tab === "inventory" && !params.get("view")) {
      params.set("view", "manage")
    }
    if (tab !== "inventory") {
      params.delete("view")
      params.delete("stock")
    }
    router.replace(`/business-admin?${params.toString()}`)
  }
  const setInventoryView = (
    view: "manage" | "fast-moving" | "stock-alerts",
    stock?: "all" | "low" | "out",
  ) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", "inventory")
    params.set("view", view)
    if (view === "stock-alerts") {
      params.set("stock", stock ?? stockFilter)
    } else {
      params.delete("stock")
    }
    router.replace(`/business-admin?${params.toString()}`)
  }
  const setStockTab = (stock: "all" | "low" | "out") => {
    setInventoryView("stock-alerts", stock)
  }

  const headerRef = useRef<HTMLElement>(null)
  const [headerHeight, setHeaderHeight] = useState(0)

  useLayoutEffect(() => {
    const el = headerRef.current
    if (!el) return

    const updateHeight = () => {
      setHeaderHeight(Math.ceil(el.getBoundingClientRect().height))
    }

    updateHeight()
    const observer = new ResizeObserver(updateHeight)
    observer.observe(el)
    window.addEventListener("resize", updateHeight)

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", updateHeight)
    }
  }, [activeTab, hero.title, loading, lastUpdatedAt])

  return (
    <div className="relative z-20 mx-auto w-full max-w-7xl safe-pad-x pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-1 sm:pb-10 sm:pt-2 xl:max-w-[88rem] 2xl:max-w-[96rem]">
      <header
        ref={headerRef}
        className={cn(
          ba.headerBar,
          "left-16 right-0",
          "top-[calc(max(4rem,env(safe-area-inset-top))+4.25rem)]",
          "lg:left-72 lg:top-0 xl:left-80",
        )}
      >
        <div className="mx-auto w-full max-w-7xl space-y-2 px-3 pb-2 pt-1 safe-pad-x sm:px-4 sm:pt-2 lg:max-w-none lg:px-6 xl:max-w-[88rem] 2xl:max-w-[96rem]">
          <div
            className={cn(
              "relative overflow-hidden rounded-xl border border-white/25 px-3 py-3 sm:rounded-2xl sm:px-4 sm:py-3.5 lg:px-5",
              ba.headerGradient,
              ba.headerShadow,
              ba.textOnPrimary,
            )}
          >
            <div className="absolute inset-0 pointer-events-none opacity-30">
              <div className="absolute -left-16 -top-16 h-32 w-32 rounded-full bg-white/35 blur-2xl" />
              <div className="absolute -right-12 -bottom-12 h-28 w-28 rounded-full bg-white/25 blur-2xl" />
            </div>
            <div className="relative flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={ba.badgePill}>
                    <Sparkles className={ba.badgePillIcon} />
                    Owner Admin
                  </span>
                  <h1 className="text-lg font-semibold tracking-tight sm:text-xl lg:text-2xl">{hero.title}</h1>
                </div>
                <p className={cn("line-clamp-1 max-w-2xl text-xs sm:text-sm", ba.textOnHeroMuted)}>{hero.description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 sm:shrink-0 sm:justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className={ba.btnHero}
                  disabled={loading}
                  onClick={() => void refreshAll()}
                >
                  <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")} />
                  Refresh
                </Button>
                <Badge variant="outline" className={cn(loading ? ba.badgeHeroMeta : ba.badgeReady)}>
                  {loading ? "Updating…" : "Ready"}
                </Badge>
                {lastUpdatedAt ? (
                  <Badge variant="outline" className={cn("hidden md:inline-flex", ba.badgeHeroMeta)}>
                    {lastUpdatedAt}
                  </Badge>
                ) : null}
                <Badge variant="outline" className={cn("max-w-[9.5rem] truncate sm:max-w-none", ba.badgeHeroMeta)}>
                  <BarChart3 className="mr-1 inline h-3 w-3 shrink-0" />
                  <span className="truncate">
                    {data?.period?.from ?? from} → {data?.period?.to ?? to}
                  </span>
                </Badge>
              </div>
            </div>
          </div>

        </div>
      </header>

      <div aria-hidden className="w-full" style={{ height: headerHeight > 0 ? headerHeight : 120 }} />

      <Tabs value={activeTab} onValueChange={(v) => setTab(v as "overview" | "inventory" | "actions" | "tips")} className="relative">
        <div className={cn(ba.mainPanel, "overflow-hidden sm:rounded-3xl")}>
          <div className={cn("owner-admin-tab-rail border-b px-3 py-3 sm:px-6 lg:px-10", ba.surfaceIce)}>
            <OwnerAdminTabStrip tabs={[...MAIN_TABS]} variant="main" />
          </div>
          <div className="space-y-5 p-3 sm:space-y-6 sm:p-6 lg:space-y-8 lg:p-10 xl:p-12">
          <TabsContent value="overview" className="mt-0 space-y-10 sm:space-y-12">
            <div className={cn("flex flex-col gap-3 pb-8 sm:flex-row sm:items-end sm:justify-between", ba.sectionDivider)}>
              <div className="space-y-1">
                <p className={ba.sectionEyebrow}>Overview</p>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Business pulse</h2>
                <p className={cn("max-w-2xl sm:text-base", ba.sectionDesc)}>
                  Start with today&apos;s numbers, set your report range, then review performance and trends below.
                </p>
              </div>
              <Badge variant="outline" className={cn("w-fit shrink-0 px-3 py-1.5", ba.badgeOutline)}>
                <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
                {data?.period?.from ?? from} → {data?.period?.to ?? to}
              </Badge>
            </div>

            <OverviewSection
              title="Today"
              description="Live snapshot of sales and stock that need attention right now."
            >
              <Card className={adminCardClass}>
                <CardHeader className={cn("flex flex-row items-start justify-between gap-4 space-y-0 px-6 py-5 sm:px-8", ba.cardHeader)}>
                  <div className="flex items-start gap-3">
                    <span className={ba.cardIcon}>
                      <Zap className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle className={cn("text-lg", adminCardTitleClass)}>Today snapshot</CardTitle>
                      <CardDescription className={cn("mt-1", ba.textSecondary)}>How the business is performing today.</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className={ba.badgeToday}>
                    Today
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-8 px-6 py-8 sm:px-8">
                  <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
                    <OverviewMetric
                      label="Today revenue"
                      value={`KSh ${Math.round(today.revenue).toLocaleString()}`}
                      hint={today.hasData ? `${today.salesCount} sale(s) today` : "No sales recorded today"}
                      icon={<BarChart3 className="h-5 w-5" />}
                      tone="blue"
                    />
                    <OverviewMetric
                      label="Stock attention"
                      value={`${stockCounts.low} low · ${stockCounts.out} out`}
                      hint="Items at or below reorder level"
                      icon={<Activity className="h-5 w-5" />}
                      tone={stockCounts.out > 0 ? "rose" : "blue"}
                    />
                  </div>
                  <div className={cn("flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between", ba.borderStrong)}>
                    <p className={cn("text-sm", ba.textSecondary)}>Jump to inventory alerts</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={ba.btnStockOut}
                        onClick={() => setStockTab("out")}
                      >
                        Out of stock ({stockCounts.out})
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={ba.btnStockLow}
                        onClick={() => setStockTab("low")}
                      >
                        Low stock ({stockCounts.low})
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </OverviewSection>

            <OverviewSection
              title="Reports"
              description="Choose a date range for charts and exports. Defaults to the last 7 days."
            >
              <Card className={adminCardClass}>
                <CardHeader className={cn("space-y-4 px-6 py-5 sm:px-8", ba.cardHeader)}>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-3">
                      <span className={ba.cardIcon}>
                        <CalendarRange className="h-5 w-5" />
                      </span>
                      <div>
                        <CardTitle className={cn("text-lg", adminCardTitleClass)}>Reports range</CardTitle>
                        <CardDescription className={cn("mt-1", ba.textSecondary)}>
                          Applies to KPIs, revenue trend, and daily sales below.
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        className={ba.btnOutline}
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
                        className={ba.btnOutline}
                        onClick={() => {
                          const params = new URLSearchParams({ from, to })
                          window.location.href = `/api/business-admin/exports/sales/pdf?${params.toString()}`
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export PDF
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-6 py-8 sm:px-8">
                  <div className={cn("p-5 sm:p-6", ba.innerPanel)}>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto] lg:items-end lg:gap-4">
                      <div className="space-y-2">
                        <Label className={ba.textPrimary}>From</Label>
                        <Input
                          type="date"
                          value={from}
                          onChange={(e) => setFrom(e.target.value)}
                          className={cn("h-11", ba.input)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className={ba.textPrimary}>To</Label>
                        <Input
                          type="date"
                          value={to}
                          onChange={(e) => setTo(e.target.value)}
                          className={cn("h-11", ba.input)}
                        />
                      </div>
                      <Button
                        className={cn("h-11 w-full lg:w-auto lg:min-w-[8.5rem]", ba.primary)}
                        onClick={() => void loadData()}
                      >
                        Apply range
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn("h-11 w-full lg:w-auto", ba.btnOutline)}
                        disabled={loading}
                        onClick={() => void refreshAll()}
                      >
                        <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
                        Refresh
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </OverviewSection>

            <OverviewSection
              title="Range performance"
              description="Summary metrics for the dates selected above."
            >
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
                <TapKpiCard
                  title="Range revenue"
                  value={`KSh ${Math.round(data?.metrics.revenue || 0).toLocaleString()}`}
                  sub="Total in selected range"
                  icon={<BarChart3 className="h-5 w-5" />}
                  tone="blue"
                />
                <TapKpiCard
                  title="Sales count"
                  value={`${data?.metrics.salesCount || 0}`}
                  sub="Transactions in range"
                  icon={<Activity className="h-5 w-5" />}
                  tone="blue"
                />
                <TapKpiCard
                  title="Stock value"
                  value={`KSh ${Math.round(data?.metrics.totalStockValue || 0).toLocaleString()}`}
                  sub="Inventory value estimate"
                  icon={<Boxes className="h-5 w-5" />}
                  tone="navy"
                />
                <TapKpiCard
                  title="Health score"
                  value={`${data?.metrics.overallHealthScore || 0}%`}
                  sub="Overall business health"
                  icon={<Sparkles className="h-5 w-5" />}
                  tone="cyan"
                />
              </div>
            </OverviewSection>

            <OverviewSection
              title="Trends & daily sales"
              description="Visual revenue trend followed by a day-by-day breakdown."
            >
              <div className="space-y-6 lg:space-y-8">
                <Card className={adminCardClass}>
                  <CardHeader className={cn("px-6 py-5 sm:px-8", ba.cardHeader)}>
                    <CardTitle className={adminCardTitleClass}>Revenue trend</CardTitle>
                    <CardDescription className={cn("mt-1.5 max-w-3xl", ba.textSecondary)}>
                      Daily revenue for your selected range. Red markers flag unusual days when enough data exists.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 py-8 sm:px-8">
                    {!loading && !hasRangeData ? (
                      <EmptyState
                        title="No revenue data in this range"
                        description="Try adjusting the date range, or make a few sales to start seeing trends."
                        icon={<BarChart3 className="h-5 w-5" />}
                      />
                    ) : (
                      <div className="h-[240px] w-full min-w-0 sm:h-[300px] lg:h-[340px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={data?.trends?.dailyRevenue || []} margin={{ top: 16, right: 20, left: 8, bottom: 12 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={ba.chartGrid} vertical={false} />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={12} />
                            <YAxis
                              tick={{ fontSize: 12 }}
                              width={64}
                              tickFormatter={(v) =>
                                Number(v) >= 1000 ? `KSh ${Math.round(Number(v) / 1000)}k` : `KSh ${v}`
                              }
                            />
                            <Tooltip
                              contentStyle={{
                                borderRadius: "12px",
                                border: `1px solid ${ba.chartTooltipBorder}`,
                                boxShadow: "0 8px 24px rgba(13,148,136,0.15)",
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="revenue"
                              stroke={ba.chartLine}
                              strokeWidth={2.5}
                              dot={(props: any) => {
                                const anomaly = Boolean(props?.payload?.anomaly)
                                const key = `${props?.payload?.date ?? ""}-${props?.cx ?? ""}-${props?.cy ?? ""}`
                                return (
                                  <circle
                                    key={key}
                                    cx={props.cx}
                                    cy={props.cy}
                                    r={4}
                                    fill={anomaly ? "#ef4444" : ba.chartLine}
                                    stroke="#ffffff"
                                    strokeWidth={2}
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

                <Card className={adminCardClass}>
                  <CardHeader className="border-b border-sky-200/80 px-6 py-5 sm:px-8">
                    <CardTitle className={adminCardTitleClass}>Sales by day</CardTitle>
                    <CardDescription className="mt-1.5 text-slate-600">
                      One row per day in the selected range.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 px-6 py-8 sm:px-8">
                    {salesDays.length === 0 ? (
                      <EmptyState
                        title="No sales in this range"
                        description="Sales will appear here once transactions are recorded."
                        icon={<Activity className="h-5 w-5" />}
                      />
                    ) : (
                      salesDays.map((row) => (
                        <div
                          key={row.date}
                          className="flex flex-col justify-between gap-2 rounded-xl border border-sky-200 bg-white px-4 py-4 transition-colors hover:border-sky-200 hover:bg-sky-50/40 sm:flex-row sm:items-center"
                        >
                          <p className="font-medium text-slate-900">{row.date}</p>
                          <p className="text-sm tabular-nums text-slate-600 sm:text-base">
                            KSh {Math.round(row.revenue).toLocaleString()}
                            <span className="mx-2 text-sky-300">·</span>
                            {row.salesCount} sale{row.salesCount === 1 ? "" : "s"}
                          </p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </OverviewSection>
          </TabsContent>

          <TabsContent value="inventory" className="mt-0 space-y-4 lg:space-y-6">
            <OwnerAdminTabIntro
              eyebrow="Inventory"
              title="Stock & products"
              description="Manage catalogue, track fast movers, and resolve low or out-of-stock items."
            />
            <Tabs
              value={inventoryView}
              onValueChange={(v) => setInventoryView(v as "manage" | "fast-moving" | "stock-alerts")}
              className="space-y-4 lg:space-y-6"
            >
              <OwnerAdminTabStrip tabs={[...INVENTORY_SUB_TABS]} variant="sub" />

              <TabsContent value="manage" className="mt-0">
                <OwnerAdminInventoryPanel />
              </TabsContent>

              <TabsContent value="fast-moving" className="mt-0">
                <Card className={adminCardClass}>
                  <CardHeader>
                    <CardTitle className={adminCardTitleClass}>Fast moving products</CardTitle>
                    <CardDescription className={ba.textSecondary}>
                      Top sellers for {data?.period?.from ?? from} → {data?.period?.to ?? to}.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 lg:p-8">
                    {loading ? (
                      <EmptyState
                        title="Loading sales insights…"
                        description="Crunching sales by product."
                        icon={<Boxes className="h-5 w-5" />}
                        variant="loading"
                      />
                    ) : null}
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                      {(data?.topProducts || []).map((item, index) => (
                        <div
                          key={item.id}
                          className={cn(
                            "rounded-xl p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                            ba.card,
                            "bg-gradient-to-br from-white via-white to-sky-50/60",
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <span className={ba.rankBadge}>
                              {index + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900">{item.name}</p>
                              <p className="mt-1 text-sm text-slate-600">
                                {item.quantitySold} sold • KSh {Math.round(item.revenue).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {!loading && (!data?.topProducts || data.topProducts.length === 0) ? (
                      <EmptyState
                        title="No product sales in this range"
                        description="When sales happen, your fastest movers will appear here."
                        icon={<Boxes className="h-5 w-5" />}
                      />
                    ) : null}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="stock-alerts" className="mt-0">
                <Card className={adminCardClass}>
                  <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between lg:items-center">
                    <div>
                      <CardTitle className={adminCardTitleClass}>Low & out of stock</CardTitle>
                      <CardDescription className={ba.textSecondary}>
                        Items that need restocking attention.
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className={stockFilter === "all" ? ba.btnFilterActive : ba.btnFilterInactive}
                        onClick={() => setStockTab("all")}
                      >
                        All
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={stockFilter === "low" ? ba.btnFilterLowActive : ba.btnFilterInactive}
                        onClick={() => setStockTab("low")}
                      >
                        Low
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={stockFilter === "out" ? ba.btnFilterOutActive : ba.btnFilterInactive}
                        onClick={() => setStockTab("out")}
                      >
                        Out
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 lg:p-8">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                      {filteredStockAlerts.map((item) => (
                        <div
                          key={item.id}
                          className={cn(
                            "rounded-xl border p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                            item.status === "out"
                              ? "border-rose-200 bg-gradient-to-br from-rose-50/90 to-white"
                              : "border-amber-200 bg-gradient-to-br from-amber-50/90 to-white",
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-slate-900">{item.name}</p>
                            <Badge
                              variant={item.status === "out" ? "destructive" : "outline"}
                              className={
                                item.status === "low"
                                  ? "shrink-0 border-amber-300 bg-amber-100 text-amber-900"
                                  : "shrink-0"
                              }
                            >
                              {item.status === "out" ? "Out" : "Low"}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm text-slate-600">{item.category}</p>
                          <p className={cn("mt-1 text-sm", ba.textSecondary)}>
                            Qty {item.quantity} • Reorder at {item.reorderLevel}
                          </p>
                        </div>
                      ))}
                    </div>
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
            </Tabs>
          </TabsContent>

          <TabsContent value="actions" className="mt-0 space-y-5 sm:space-y-6">
            <OwnerAdminTabIntro
              eyebrow="Actions"
              title="Business activity"
              description="Product and inventory changes logged for your selected date range."
            />
            <Card className={adminCardClass}>
              <CardHeader>
                <CardTitle className={adminCardTitleClass}>Business Actions Summary</CardTitle>
                <CardDescription className={ba.textSecondary}>Key activity tracked on this account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-800">
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
                  <div className="grid gap-4 sm:grid-cols-2 lg:gap-6">
                    <div className={cn("p-5 shadow-sm lg:p-6", ba.innerPanel)}>
                      <p className={cn("text-xs uppercase tracking-wide lg:text-sm", ba.sectionEyebrow)}>Product activity</p>
                      <div className="mt-3 grid gap-2 text-sm lg:grid-cols-3 lg:gap-4 lg:text-base">
                        <p className={cn("tabular-nums", ba.statTile)}>
                          <span className={cn("block text-xs", ba.textAccent)}>Created</span>
                          {data?.actions.created || 0}
                        </p>
                        <p className={cn("tabular-nums", ba.statTile)}>
                          <span className={cn("block text-xs", ba.textAccent)}>Edited</span>
                          {data?.actions.edited || 0}
                        </p>
                        <p className={cn("tabular-nums sm:col-span-2 lg:col-span-1", ba.statTile)}>
                          <span className={cn("block text-xs", ba.textAccent)}>Deleted</span>
                          {data?.actions.deleted || 0}
                        </p>
                      </div>
                    </div>
                    <div className={cn("p-5 shadow-sm lg:p-6", ba.innerPanel)}>
                      <p className={cn("text-xs uppercase tracking-wide lg:text-sm", ba.sectionEyebrow)}>Stock status</p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:gap-4">
                        <p className={cn("text-sm lg:text-base", ba.statTile)}>
                          <span className={cn("block text-xs", ba.textAccent)}>Low stock</span>
                          <span className={cn("text-2xl font-semibold tabular-nums", ba.textPrimary)}>{stockCounts.low}</span>
                        </p>
                        <p className={cn("text-sm lg:text-base", ba.statTile)}>
                          <span className={cn("block text-xs", ba.textAccent)}>Out of stock</span>
                          <span className="text-2xl font-semibold tabular-nums text-rose-700">{stockCounts.out}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tips" className="mt-0 space-y-5 sm:space-y-6">
            <OwnerAdminTabIntro
              eyebrow="Tips"
              title="Smart recommendations"
              description="Suggestions based on your latest sales and stock performance."
            />
            <Card className={adminCardClass}>
              <CardHeader>
                <CardTitle className={adminCardTitleClass}>Business Tips</CardTitle>
                <CardDescription className={ba.textAccent}>System-generated recommendations from current performance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-4 xl:grid-cols-3">
                {loading ? (
                  <div className="lg:col-span-2 xl:col-span-3">
                    <EmptyState
                      title="Generating tips…"
                      description="Analyzing current performance."
                      icon={<Lightbulb className="h-5 w-5" />}
                      variant="loading"
                    />
                  </div>
                ) : null}
                {(data?.tips || []).map((tip, idx) => (
                  <div
                    key={idx}
                    className={cn("flex gap-3 text-sm transition-colors", ba.tipCard)}
                  >
                    <span className={cn("mt-0.5", ba.tipIcon)}>
                      <Lightbulb className="h-4 w-4" />
                    </span>
                    <p className="min-w-0 leading-relaxed">{tip}</p>
                  </div>
                ))}
                {!loading && (!data?.tips || data.tips.length === 0) ? (
                  <div className="lg:col-span-2 xl:col-span-3">
                    <EmptyState
                      title="No tips yet"
                      description="When there’s enough activity, we’ll surface useful suggestions here."
                      icon={<Lightbulb className="h-5 w-5" />}
                    />
                  </div>
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

function OverviewSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-5 sm:space-y-6">
      <div className="space-y-1 px-0.5">
        <h3 className={ba.sectionTitle}>{title}</h3>
        <p className={ba.sectionDesc}>{description}</p>
      </div>
      {children}
    </section>
  )
}

function OverviewMetric({
  label,
  value,
  hint,
  icon,
  tone = "blue",
}: {
  label: string
  value: string
  hint: string
  icon: React.ReactNode
  tone?: "blue" | "rose"
}) {
  const toneChip: Record<string, string> = {
    blue: ba.kpiBlue.chip,
    rose: "bg-rose-50 text-rose-700 border border-rose-200",
  }

  return (
    <div className={ba.metricCard}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <p className={cn("text-xs font-semibold uppercase tracking-wider", ba.textAccent)}>{label}</p>
          <p className={cn("text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl", ba.textPrimary)}>{value}</p>
          <p className={cn("text-sm leading-relaxed", ba.textSecondary)}>{hint}</p>
        </div>
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
            toneChip[tone] ?? toneChip.blue,
          )}
        >
          {icon}
        </span>
      </div>
    </div>
  )
}

function TapKpiCard({
  title,
  value,
  sub,
  icon,
  tone = "blue",
}: {
  title: string
  value: string
  sub: string
  icon: React.ReactNode
  tone?: "blue" | "navy" | "cyan" | "rose"
}) {
  const toneStyles: Record<string, { ring: string; chip: string; glow: string }> = {
    blue: ba.kpiBlue,
    navy: ba.kpiNavy,
    cyan: ba.kpiCyan,
    rose: {
      ring: "ring-rose-100/70",
      chip: "bg-rose-50 text-rose-700 border-rose-200",
      glow: "shadow-[0_18px_50px_-30px_rgba(244,63,94,0.35)]",
    },
  }
  const t = toneStyles[tone] ?? toneStyles.blue

  return (
    <div
      className={cn(
        "owner-admin-card w-full rounded-2xl border p-4 text-left transition-all duration-200 ring-1 hover:-translate-y-0.5 lg:p-5",
        ba.surface,
        ba.border,
        t.ring,
        t.glow,
      )}
    >
      <div className="flex items-start justify-between gap-3 lg:gap-4">
        <div className="min-w-0 flex-1">
          <p className={cn("text-[11px] font-semibold uppercase tracking-wider sm:text-xs", ba.textAccent)}>{title}</p>
          <p className={cn("mt-1 text-xl font-semibold tracking-tight tabular-nums sm:text-2xl lg:text-3xl", ba.textPrimary)}>{value}</p>
          <p className={cn("mt-1 text-xs leading-relaxed sm:text-sm lg:text-[15px]", ba.textSecondary)}>{sub}</p>
        </div>
        <span className={cn("inline-flex shrink-0 items-center justify-center rounded-xl border p-2.5 sm:px-3 sm:py-2 lg:p-3", t.chip)}>
          {icon}
        </span>
      </div>
    </div>
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
    <div className={ba.emptyState}>
      <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:text-left">
        <div className={cn(ba.emptyStateIcon, variant === "loading" && "animate-pulse")}>{icon}</div>
        <div className="min-w-0">
          <p className={cn("text-sm font-semibold", ba.textPrimary)}>{title}</p>
          <p className={cn("mt-1 text-sm leading-relaxed", ba.textSecondary)}>{description}</p>
        </div>
      </div>
    </div>
  )
}
