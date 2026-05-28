import { NextResponse } from "next/server"
import { db } from "@/lib/database"
import { getBusinessAdminSession } from "@/lib/business-admin-auth"

function csvEscape(value: unknown) {
  const s = String(value ?? "")
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function parseDateOnly(value: string | null) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
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
    const session = await getBusinessAdminSession(request)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fromRaw = searchParams.get("from")
    const toRaw = searchParams.get("to")
    const from = parseDateOnly(fromRaw)
    const to = parseDateOnly(toRaw)
    const rangeStart = from ? startOfDay(from) : null
    const rangeEnd = to ? endOfDay(to) : null

    const sql = await db()
    const salesRows =
      rangeStart && rangeEnd
        ? await sql`
            SELECT id, total, item_count, date
            FROM sales
            WHERE user_id = ${session.userId}
              AND date >= ${rangeStart.toISOString()}
              AND date <= ${rangeEnd.toISOString()}
            ORDER BY date DESC
          `
        : await sql`
            SELECT id, total, item_count, date
            FROM sales
            WHERE user_id = ${session.userId}
            ORDER BY date DESC
          `

    const saleIds = salesRows.map((r) => r.id as string)
    const itemsRows =
      saleIds.length === 0
        ? []
        : await sql`
            SELECT sale_id, product_id, product_name, unit_price, quantity, unit, category, subtotal
            FROM sale_items
            WHERE sale_id = ANY(${saleIds})
            ORDER BY id ASC
          `

    const header = [
      "sale_id",
      "sale_date",
      "sale_total",
      "sale_item_count",
      "product_id",
      "product_name",
      "unit_price",
      "quantity",
      "unit",
      "category",
      "subtotal",
    ].join(",")

    const saleById = new Map<string, any>()
    for (const sale of salesRows) saleById.set(String(sale.id), sale)

    const lines: string[] = [header]
    for (const item of itemsRows) {
      const sale = saleById.get(String(item.sale_id))
      lines.push(
        [
          csvEscape(item.sale_id),
          csvEscape(sale?.date ? new Date(String(sale.date)).toISOString() : ""),
          csvEscape(sale?.total ?? ""),
          csvEscape(sale?.item_count ?? ""),
          csvEscape(item.product_id),
          csvEscape(item.product_name),
          csvEscape(item.unit_price),
          csvEscape(item.quantity),
          csvEscape(item.unit),
          csvEscape(item.category),
          csvEscape(item.subtotal),
        ].join(","),
      )
    }

    if (itemsRows.length === 0) {
      for (const sale of salesRows) {
        lines.push([csvEscape(sale.id), csvEscape(new Date(String(sale.date)).toISOString()), csvEscape(sale.total), csvEscape(sale.item_count), "", "", "", "", "", "", ""].join(","))
      }
    }

    const csv = lines.join("\n")
    const label = fromRaw && toRaw ? `${fromRaw}_to_${toRaw}` : "all-time"
    const filename = `sales-export_${label}_${new Date().toISOString().split("T")[0]}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("Business admin CSV export error:", error)
    return NextResponse.json({ error: "Failed to export CSV" }, { status: 500 })
  }
}

