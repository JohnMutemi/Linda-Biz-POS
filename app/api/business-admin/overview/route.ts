import { NextResponse } from "next/server"
import { db } from "@/lib/database"
import { getBusinessAdminSession } from "@/lib/business-admin-auth"
import { isLowStock, isOutOfStock } from "@/lib/inventory-stock"

function formatDateOnly(value: Date) {
  return value.toISOString().slice(0, 10)
}

function nairobiDayRange(now = new Date()) {
  // East Africa Time (UTC+3): reliable "business day" boundaries for KSh workflows.
  const offsetMs = 3 * 60 * 60 * 1000
  const localMs = now.getTime() + offsetMs
  const local = new Date(localMs)
  const year = local.getUTCFullYear()
  const month = local.getUTCMonth()
  const day = local.getUTCDate()
  const startLocalMs = Date.UTC(year, month, day, 0, 0, 0, 0)
  const endLocalMs = Date.UTC(year, month, day, 23, 59, 59, 999)

  return {
    startIso: new Date(startLocalMs - offsetMs).toISOString(),
    endIso: new Date(endLocalMs - offsetMs).toISOString(),
  }
}

function toNairobiDateKey(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value)
  const shifted = new Date(date.getTime() + 3 * 60 * 60 * 1000)
  return shifted.toISOString().slice(0, 10)
}

function toDateKeyInput(value: string | null, fallback: Date) {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  if (value) {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) return toNairobiDateKey(parsed)
  }
  return toNairobiDateKey(fallback)
}

function addOneDay(dateKey: string) {
  const d = new Date(`${dateKey}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

function parseDateParam(value: string | null, fallback: Date, bound: "start" | "end") {
  if (!value) return fallback

  const hasTime = value.includes("T")
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return fallback
  }

  if (!hasTime) {
    if (bound === "start") {
      parsed.setHours(0, 0, 0, 0)
    } else {
      parsed.setHours(23, 59, 59, 999)
    }
  }

  return parsed
}

export async function GET(request: Request) {
  try {
    const session = await getBusinessAdminSession(request)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const now = new Date()
    const defaultFrom = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)
    const fromDayKey = toDateKeyInput(from, defaultFrom)
    const toDayKey = toDateKeyInput(to, now)
    const fromDate = parseDateParam(from, defaultFrom, "start")
    const toDate = parseDateParam(to, now, "end")
    const fromIso = fromDate.toISOString()
    const toIso = toDate.toISOString()

    const sql = await db()
    const products = await sql`
      SELECT id, name, price, quantity, reorder_level, category
      FROM products
      WHERE user_id = ${session.userId}
      ORDER BY name ASC
    `

    const allSales = await sql`
      SELECT id, total, date
      FROM sales
      WHERE user_id = ${session.userId}
      ORDER BY date DESC
    `
    const rangeSales = allSales.filter((sale) => {
      const day = toNairobiDateKey(String(sale.date))
      return day >= fromDayKey && day <= toDayKey
    })
    const todayRange = nairobiDayRange(now)
    const todaySalesRows = await sql`
      SELECT total
      FROM sales
      WHERE user_id = ${session.userId}
        AND date >= ${todayRange.startIso}
        AND date <= ${todayRange.endIso}
    `

    const topProducts = await sql`
      SELECT
        si.product_id,
        COALESCE(NULLIF(si.product_name, ''), p.name, 'Unknown Product') AS product_name,
        SUM(si.quantity)::INT AS quantity_sold,
        SUM(si.subtotal)::DOUBLE PRECISION AS revenue
      FROM sale_items si
      JOIN sales s ON s.id = si.sale_id
      LEFT JOIN products p ON p.id = si.product_id
      WHERE s.user_id = ${session.userId}
        AND s.date >= ${fromIso}
        AND s.date <= ${toIso}
      GROUP BY si.product_id, COALESCE(NULLIF(si.product_name, ''), p.name, 'Unknown Product')
      ORDER BY quantity_sold DESC
      LIMIT 8
    `

    const actionRows = await sql`
      SELECT action, COUNT(*)::INT AS total
      FROM business_activity_logs
      WHERE user_id = ${session.userId}
        AND created_at >= ${fromIso}
        AND created_at <= ${toIso}
      GROUP BY action
    `

    const totalProducts = products.length
    const totalStockValue = products.reduce((sum, p) => sum + Number(p.price) * Number(p.quantity), 0)
    const lowStockProducts = products.filter((p) =>
      isLowStock({ quantity: Number(p.quantity), reorder_level: p.reorder_level }),
    ).length
    const outOfStockProducts = products.filter((p) => isOutOfStock({ quantity: Number(p.quantity) })).length

    const revenue = rangeSales.reduce((sum, s) => sum + Number(s.total), 0)
    const salesCount = rangeSales.length
    const averageOrderValue = salesCount > 0 ? revenue / salesCount : 0
    const todayRevenue = todaySalesRows.reduce((sum, s) => sum + Number(s.total), 0)
    const todaySalesCount = todaySalesRows.length

    const actionCounts = actionRows.reduce(
      (acc, row) => {
        const reason = String(row.action || "").toLowerCase()
        const total = Number(row.total || 0)
        if (reason === "product_created") acc.created += total
        if (reason === "product_edited") acc.edited += total
        if (reason === "product_deleted") acc.deleted += total
        acc.all += total
        return acc
      },
      { created: 0, edited: 0, deleted: 0, all: 0 },
    )

    const stockAttention = lowStockProducts + outOfStockProducts
    const stockHealth =
      totalProducts === 0 ? 0 : Math.round(((totalProducts - stockAttention) / totalProducts) * 100)
    const revenueHealth = revenue > 0 ? 100 : 25
    const actionHealth = actionCounts.all > 0 ? 100 : 45
    const overallHealthScore = Math.round(stockHealth * 0.5 + revenueHealth * 0.35 + actionHealth * 0.15)

    const tips: string[] = []
    if (lowStockProducts > 0) tips.push(`Restock ${lowStockProducts} low-stock product(s) to avoid missed sales.`)
    if (salesCount < 5) tips.push("Sales volume is low for this period; run a short promotion on top sellers.")
    if (topProducts.length > 0) tips.push(`Bundle "${topProducts[0].product_name}" with a complementary item to increase order value.`)
    if (tips.length === 0) tips.push("Performance is healthy. Focus on product mix expansion and customer retention.")

    const byDay = new Map<string, { revenue: number; salesCount: number }>()
    for (const sale of rangeSales) {
      const dateKey = toNairobiDateKey(String(sale.date))
      const current = byDay.get(dateKey) ?? { revenue: 0, salesCount: 0 }
      current.revenue += Number(sale.total)
      current.salesCount += 1
      byDay.set(dateKey, current)
    }

    const dates: string[] = []
    for (let day = fromDayKey; day <= toDayKey; day = addOneDay(day)) {
      dates.push(day)
    }

    const dailyRevenueRaw = dates.map((date) => {
      const item = byDay.get(date)
      return { date, revenue: item?.revenue ?? 0, salesCount: item?.salesCount ?? 0 }
    })

    const revenueValues = dailyRevenueRaw.map((d) => d.revenue)
    const mean = revenueValues.length ? revenueValues.reduce((a, b) => a + b, 0) / revenueValues.length : 0
    const variance =
      revenueValues.length > 1 ? revenueValues.reduce((sum, v) => sum + (v - mean) * (v - mean), 0) / (revenueValues.length - 1) : 0
    const std = Math.sqrt(variance)
    const hasEnoughPoints = revenueValues.length >= 5 && std > 0
    const dailyRevenue = dailyRevenueRaw.map((d) => {
      const anomaly = hasEnoughPoints ? Math.abs(d.revenue - mean) >= 2 * std : false
      return { ...d, anomaly }
    })

    return NextResponse.json({
      period: {
        from: formatDateOnly(new Date(fromIso)),
        to: formatDateOnly(new Date(toIso)),
      },
      metrics: {
        totalProducts,
        totalStockValue,
        lowStockProducts,
        outOfStockProducts,
        revenue,
        salesCount,
        todayRevenue,
        todaySalesCount,
        averageOrderValue,
        overallHealthScore,
      },
      trends: {
        dailyRevenue,
      },
      topProducts: topProducts.map((row) => ({
        id: String(row.product_id),
        name: String(row.product_name),
        quantitySold: Number(row.quantity_sold),
        revenue: Number(row.revenue),
      })),
      actions: actionCounts,
      tips,
    })
  } catch (error) {
    console.error("Business admin overview error:", error)
    return NextResponse.json({ error: "Failed to load overview" }, { status: 500 })
  }
}
