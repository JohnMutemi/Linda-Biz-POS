import { NextResponse } from "next/server"
import { db } from "@/lib/database"
import { getSessionTokenFromCookieHeader, verifySessionToken } from "@/lib/auth"

async function getAuthenticatedUserId(request: Request) {
  const token = getSessionTokenFromCookieHeader(request.headers.get("cookie"))
  if (!token) return null
  try {
    const session = await verifySessionToken(token)
    return session.userId
  } catch {
    return null
  }
}

function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export async function GET(request: Request) {
  try {
    const authenticatedUserId = await getAuthenticatedUserId(request)
    if (!authenticatedUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const days = Math.max(1, Math.min(365, Number(searchParams.get("days") || "30")))
    const limit = Math.max(3, Math.min(20, Number(searchParams.get("limit") || "8")))

    if (!userId || userId !== authenticatedUserId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const now = new Date()
    const from = startOfDay(new Date(now.getTime() - days * 24 * 60 * 60 * 1000))
    const to = endOfDay(now)

    const sql = await db()
    const rows = await sql`
      SELECT
        si.product_id,
        MAX(si.product_name) AS product_name,
        SUM(si.quantity)::INT AS quantity_sold
      FROM sale_items si
      INNER JOIN sales s ON s.id = si.sale_id
      WHERE s.user_id = ${userId} AND s.date >= ${from.toISOString()} AND s.date <= ${to.toISOString()}
      GROUP BY si.product_id
      ORDER BY quantity_sold DESC
      LIMIT ${limit}
    `

    const items = rows.map((r) => ({
      productId: r.product_id as string,
      name: (r.product_name as string) || "Item",
      quantitySold: Number(r.quantity_sold),
    }))

    return NextResponse.json({ from: from.toISOString(), to: to.toISOString(), days, items })
  } catch (error) {
    console.error("Top products analytics error:", error)
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 })
  }
}

