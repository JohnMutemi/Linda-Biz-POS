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

    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman)
    const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)

    const palette = {
      ink: rgb(0.09, 0.08, 0.07),
      mutedInk: rgb(0.35, 0.31, 0.26),
      accent: rgb(0.72, 0.58, 0.31),
      panel: rgb(0.98, 0.97, 0.94),
      line: rgb(0.85, 0.79, 0.69),
      white: rgb(1, 1, 1),
    }

    const margin = 40
    const contentWidth = width - margin * 2
    const pad = 12
    let y = height - margin

    const truncateText = (value: string, maxWidth: number, activeFont = font, size = 9) => {
      if (activeFont.widthOfTextAtSize(value, size) <= maxWidth) return value
      const ellipsis = "..."
      let end = value.length
      while (end > 0) {
        const candidate = `${value.slice(0, end).trimEnd()}${ellipsis}`
        if (activeFont.widthOfTextAtSize(candidate, size) <= maxWidth) return candidate
        end -= 1
      }
      return ellipsis
    }

    const drawSectionLabel = (label: string, sectionY: number) => {
      page.drawText(label.toUpperCase(), { x: margin, y: sectionY, size: 9, font: fontBold, color: palette.accent })
      page.drawLine({
        start: { x: margin + 130, y: sectionY + 3 },
        end: { x: width - margin, y: sectionY + 3 },
        thickness: 0.8,
        color: palette.line,
      })
      return sectionY - 14
    }

    // Header band
    const headerHeight = 88
    const headerY = y - headerHeight
    page.drawRectangle({
      x: margin,
      y: headerY,
      width: contentWidth,
      height: headerHeight,
      color: palette.ink,
    })
    page.drawText("Sales Report", {
      x: margin + pad,
      y: headerY + headerHeight - 30,
      size: 20,
      font: fontBold,
      color: palette.white,
    })
    page.drawText(`Period: ${periodLabel}`, {
      x: margin + pad,
      y: headerY + headerHeight - 48,
      size: 10,
      font,
      color: rgb(0.92, 0.88, 0.76),
    })
    page.drawText(`Generated: ${new Date().toLocaleString()}`, {
      x: margin + pad,
      y: headerY + 16,
      size: 9.5,
      font,
      color: rgb(0.89, 0.85, 0.74),
    })
    if (businessName) {
      page.drawText(truncateText(`Business: ${businessName}`, contentWidth * 0.45, fontBold, 10), {
        x: margin + contentWidth - contentWidth * 0.45 - pad,
        y: headerY + 16,
        size: 10,
        font: fontBold,
        color: palette.white,
      })
    }
    y = headerY - 18

    // Metrics cards
    const cardGap = 10
    const cardWidth = (contentWidth - cardGap * 1) / 2
    const cardHeight = 46
    const stats: Array<{ label: string; value: string }> = [
      { label: "Revenue", value: `KSh ${Math.round(totalRevenue).toLocaleString()}` },
      { label: "Average Sale", value: `KSh ${Math.round(average).toLocaleString()}` },
      { label: "Transactions", value: `${totalTransactions}` },
      { label: "Items Sold", value: `${totalItems}` },
    ]
    for (let i = 0; i < stats.length; i++) {
      const row = Math.floor(i / 2)
      const col = i % 2
      const x = margin + col * (cardWidth + cardGap)
      const cardY = y - row * (cardHeight + 8) - cardHeight
      page.drawRectangle({
        x,
        y: cardY,
        width: cardWidth,
        height: cardHeight,
        color: rgb(0.99, 0.98, 0.95),
        borderColor: palette.line,
        borderWidth: 1,
      })
      page.drawText(stats[i].label, { x: x + pad, y: cardY + 28, size: 9, font, color: palette.mutedInk })
      page.drawText(stats[i].value, { x: x + pad, y: cardY + 12, size: 13, font: fontBold, color: palette.ink })
    }
    y = y - 2 * (cardHeight + 8) - 8

    // Executive summary
    y = drawSectionLabel("Executive Summary", y)
    const performanceNote =
      totalTransactions === 0
        ? "No transactions were recorded for this period."
        : `This period recorded ${totalTransactions} transactions, ${totalItems} items sold, and KSh ${Math.round(
            totalRevenue,
          ).toLocaleString()} in revenue.`
    page.drawRectangle({
      x: margin,
      y: y - 30,
      width: contentWidth,
      height: 30,
      color: rgb(0.99, 0.98, 0.95),
      borderColor: palette.line,
      borderWidth: 1,
    })
    page.drawText(truncateText(performanceNote, contentWidth - pad * 2, font, 9.5), {
      x: margin + pad,
      y: y - 18,
      size: 9.5,
      font,
      color: palette.ink,
    })
    y -= 42

    // Top products
    y = drawSectionLabel("Top Selling Products", y)
    if (topProducts.length > 0) {
      for (const [name, qty] of topProducts) {
        if (y < margin + 70) break
        page.drawText("•", { x: margin + 2, y, size: 11, font, color: palette.accent })
        page.drawText(truncateText(name, contentWidth - 120, font, 9.5), {
          x: margin + 14,
          y,
          size: 9.5,
          font,
          color: palette.ink,
        })
        const qtyText = `${qty} unit${qty === 1 ? "" : "s"}`
        const qtyWidth = fontBold.widthOfTextAtSize(qtyText, 9.5)
        page.drawText(qtyText, {
          x: margin + contentWidth - qtyWidth,
          y,
          size: 9.5,
          font: fontBold,
          color: palette.mutedInk,
        })
        y -= 13
      }
    } else {
      page.drawText("No product sales data available for this period.", {
        x: margin,
        y,
        size: 9.5,
        font,
        color: palette.mutedInk,
      })
      y -= 13
    }
    y -= 10

    // Recent transactions as a table
    y = drawSectionLabel("Recent Transactions", y)
    const tableTop = y
    const rowHeight = 14
    const colDate = margin
    const colId = margin + 142
    const colAmount = margin + 230
    const colItems = margin + 320

    page.drawRectangle({
      x: margin,
      y: tableTop - rowHeight,
      width: contentWidth,
      height: rowHeight,
      color: rgb(0.18, 0.16, 0.13),
      borderColor: palette.line,
      borderWidth: 1,
    })
    page.drawText("Date", { x: colDate + 6, y: tableTop - 10, size: 8.5, font: fontBold, color: rgb(0.94, 0.9, 0.79) })
    page.drawText("Sale ID", { x: colId + 6, y: tableTop - 10, size: 8.5, font: fontBold, color: rgb(0.94, 0.9, 0.79) })
    page.drawText("Amount", { x: colAmount + 6, y: tableTop - 10, size: 8.5, font: fontBold, color: rgb(0.94, 0.9, 0.79) })
    page.drawText("Items", { x: colItems + 6, y: tableTop - 10, size: 8.5, font: fontBold, color: rgb(0.94, 0.9, 0.79) })

    y = tableTop - rowHeight
    const maxRows = 11
    const shown = salesRows.slice(0, maxRows)
    for (const sale of shown) {
      if (y < margin + 26) break
      page.drawRectangle({
        x: margin,
        y: y - rowHeight,
        width: contentWidth,
        height: rowHeight,
        color: palette.white,
        borderColor: palette.line,
        borderWidth: 1,
      })

      const saleDate = new Date(sale.date as string).toLocaleDateString()
      const idShort = String(sale.id).split("_")[1] || String(sale.id).slice(0, 8)
      const amount = `KSh ${Math.round(Number(sale.total)).toLocaleString()}`
      const itemNames = itemsRows
        .filter((it) => it.sale_id === sale.id)
        .slice(0, 2)
        .map((it) => `${it.product_name}x${it.quantity}`)
        .join(", ")

      page.drawText(truncateText(saleDate, 130, font, 8.5), { x: colDate + 6, y: y - 10, size: 8.5, font, color: palette.ink })
      page.drawText(truncateText(idShort, 80, font, 8.5), { x: colId + 6, y: y - 10, size: 8.5, font, color: palette.ink })
      page.drawText(truncateText(amount, 84, fontBold, 8.5), {
        x: colAmount + 6,
        y: y - 10,
        size: 8.5,
        font: fontBold,
        color: palette.ink,
      })
      page.drawText(truncateText(itemNames || "-", contentWidth - (colItems - margin) - 12, font, 8.5), {
        x: colItems + 6,
        y: y - 10,
        size: 8.5,
        font,
        color: palette.mutedInk,
      })

      y -= rowHeight
    }

    if (salesRows.length > maxRows && y > margin + 20) {
      page.drawText(`+ ${salesRows.length - maxRows} more transactions not shown`, {
        x: margin,
        y: y - 12,
        size: 8.5,
        font,
        color: palette.mutedInk,
      })
      y -= 16
    }

    // Footer
    page.drawLine({
      start: { x: margin, y: margin + 8 },
      end: { x: width - margin, y: margin + 8 },
      thickness: 1,
      color: palette.line,
    })
    page.drawText("Confidential business document", {
      x: margin,
      y: margin - 2,
      size: 8,
      font,
      color: palette.mutedInk,
    })
    page.drawText("Generated by PointOfSale", {
      x: width - margin - 95,
      y: margin - 2,
      size: 8,
      font,
      color: palette.mutedInk,
    })

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

