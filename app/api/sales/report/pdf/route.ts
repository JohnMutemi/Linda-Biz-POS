import { NextResponse } from "next/server"
import { db } from "@/lib/database"
import { getSessionTokenFromCookieHeader, verifySessionToken } from "@/lib/auth"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

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

function parseDateParam(value: string | null) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d
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
    const filterType = (searchParams.get("filterType") || "today") as "today" | "week" | "month" | "custom"
    const startDateRaw = searchParams.get("startDate")
    const endDateRaw = searchParams.get("endDate")
    const periodLabelRaw = searchParams.get("periodLabel")

    if (!userId || userId !== authenticatedUserId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const now = new Date()
    let rangeStart: Date | null = null
    let rangeEnd: Date | null = null

    if (filterType === "today") {
      rangeStart = startOfDay(now)
      rangeEnd = endOfDay(now)
    } else if (filterType === "week") {
      rangeStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      rangeEnd = now
    } else if (filterType === "month") {
      rangeStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      rangeEnd = now
    } else if (filterType === "custom") {
      const start = parseDateParam(startDateRaw)
      const end = parseDateParam(endDateRaw)
      rangeStart = start ? startOfDay(start) : null
      rangeEnd = end ? endOfDay(end) : null
    }

    const neonSql = await db()

    const [bizRow] = await neonSql`
      SELECT business_name
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `
    const businessName =
      bizRow && typeof (bizRow as { business_name?: unknown }).business_name === "string"
        ? String((bizRow as { business_name: string }).business_name).trim()
        : ""

    const salesRows =
      rangeStart && rangeEnd
        ? await neonSql`
            SELECT id, total, item_count, date
            FROM sales
            WHERE user_id = ${userId} AND date >= ${rangeStart.toISOString()} AND date <= ${rangeEnd.toISOString()}
            ORDER BY date DESC
          `
        : await neonSql`
            SELECT id, total, item_count, date
            FROM sales
            WHERE user_id = ${userId}
            ORDER BY date DESC
          `

    const saleIds = salesRows.map((r) => r.id as string)
    const itemsRows =
      saleIds.length === 0
        ? []
        : await neonSql`
            SELECT sale_id, product_name, quantity
            FROM sale_items
            WHERE sale_id = ANY(${saleIds})
            ORDER BY id ASC
          `

    const totalRevenue = salesRows.reduce((sum, s) => sum + Number(s.total), 0)
    const totalTransactions = salesRows.length
    const totalItems = salesRows.reduce((sum, s) => sum + Number(s.item_count ?? 0), 0)
    const average = totalTransactions > 0 ? totalRevenue / totalTransactions : 0
    const periodLabel =
      periodLabelRaw?.trim() ||
      (filterType === "custom" && startDateRaw && endDateRaw
        ? `${startDateRaw} to ${endDateRaw}`
        : filterType === "today"
          ? `Today (${new Date().toLocaleDateString()})`
          : filterType === "week"
            ? "Last 7 Days"
            : filterType === "month"
              ? "Last 30 Days"
              : "All Time")

    const productTotals = new Map<string, number>()
    for (const row of itemsRows) {
      const name = String(row.product_name ?? "").trim() || "Unknown item"
      const qty = Number(row.quantity ?? 0)
      productTotals.set(name, (productTotals.get(name) ?? 0) + qty)
    }
    const topProducts = [...productTotals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage()
    const { width, height } = page.getSize()

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const margin = 40
    let y = height - margin

    const title = "Sales Report"
    page.drawText(title, { x: margin, y, size: 18, font: fontBold, color: rgb(0.02, 0.43, 0.25) })
    y -= 24
    if (businessName) {
      page.drawText(`Business: ${businessName}`, { x: margin, y, size: 11, font: fontBold, color: rgb(0.06, 0.1, 0.17) })
      y -= 16
    }
    page.drawText(`Generated: ${new Date().toLocaleString()}`, { x: margin, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) })
    y -= 16
    page.drawText(`Period: ${periodLabel}`, { x: margin, y, size: 11, font: fontBold, color: rgb(0.06, 0.1, 0.17) })
    y -= 16
    page.drawText(`Transactions: ${totalTransactions}`, { x: margin, y, size: 11, font })
    y -= 14
    page.drawText(`Items sold: ${totalItems}`, { x: margin, y, size: 11, font })
    y -= 14
    page.drawText(`Revenue: KSh ${Math.round(totalRevenue).toLocaleString()}`, { x: margin, y, size: 11, font: fontBold })
    y -= 14
    page.drawText(`Average sale: KSh ${Math.round(average).toLocaleString()}`, { x: margin, y, size: 11, font })

    y -= 20
    page.drawText("Sales summary", { x: margin, y, size: 12, font: fontBold, color: rgb(0.06, 0.1, 0.17) })
    y -= 14
    const performanceNote =
      totalTransactions === 0
        ? "No transactions were recorded for this period."
        : `This period recorded ${totalTransactions} transactions, ${totalItems} items sold, and KSh ${Math.round(
            totalRevenue,
          ).toLocaleString()} in revenue.`
    page.drawText(performanceNote, { x: margin, y, size: 9.5, font, color: rgb(0.15, 0.15, 0.15) })
    y -= 20

    if (topProducts.length > 0) {
      page.drawText("Top selling products", { x: margin, y, size: 12, font: fontBold, color: rgb(0.06, 0.1, 0.17) })
      y -= 14
      for (const [name, qty] of topProducts) {
        if (y < margin + 20) break
        page.drawText(`- ${name}: ${qty} unit${qty === 1 ? "" : "s"} sold`, {
          x: margin,
          y,
          size: 9.5,
          font,
          color: rgb(0.15, 0.15, 0.15),
        })
        y -= 12
      }
      y -= 10
    }

    page.drawText("Recent transactions", { x: margin, y, size: 12, font: fontBold, color: rgb(0.06, 0.1, 0.17) })
    y -= 16

    const maxRows = 18
    const shown = salesRows.slice(0, maxRows)
    for (const sale of shown) {
      const saleDate = new Date(sale.date as string).toLocaleString()
      const idShort = String(sale.id).split("_")[1] || String(sale.id).slice(0, 8)
      const amount = `KSh ${Math.round(Number(sale.total)).toLocaleString()}`

      const itemNames = itemsRows
        .filter((it) => it.sale_id === sale.id)
        .slice(0, 3)
        .map((it) => `${it.product_name}×${it.quantity}`)
        .join(", ")

      const line = `${saleDate}  |  ${idShort}  |  ${amount}${itemNames ? `  |  ${itemNames}` : ""}`
      if (y < margin + 20) break
      page.drawText(line, { x: margin, y, size: 9, font, color: rgb(0.15, 0.15, 0.15) })
      y -= 12
    }

    if (salesRows.length > maxRows && y > margin + 12) {
      page.drawText(`…and ${salesRows.length - maxRows} more`, {
        x: margin,
        y,
        size: 9,
        font,
        color: rgb(0.35, 0.35, 0.35),
      })
    }

    const pdfBytes = await pdfDoc.save()
    const periodText =
      filterType === "custom" && startDateRaw && endDateRaw ? `${startDateRaw}_to_${endDateRaw}` : filterType
    const filename = `sales-report_${periodText}_${new Date().toISOString().split("T")[0]}.pdf`

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("Sales report PDF error:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}

