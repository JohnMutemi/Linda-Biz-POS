import { NextResponse } from "next/server"
import { db } from "@/lib/database"
import { getSessionTokenFromCookieHeader, verifySessionToken } from "@/lib/auth"
import { buildSalesPageUrl, buildSalesReportDownloadUrl, sendSaleNotificationEmail } from "@/lib/mailer"

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

export async function GET(request: Request) {
  try {
    const authenticatedUserId = await getAuthenticatedUserId(request)
    if (!authenticatedUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId || userId !== authenticatedUserId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const sql = await db()
    const salesRows = await sql`
      SELECT id, user_id, total, item_count, date
      FROM sales
      WHERE user_id = ${userId}
      ORDER BY date DESC
    `

    const itemsRows = await sql`
      SELECT sale_id, product_id, product_name, unit_price, quantity, unit, category, subtotal
      FROM sale_items
      WHERE sale_id IN (SELECT id FROM sales WHERE user_id = ${userId})
      ORDER BY id ASC
    `

    const itemsBySale = new Map<string, any[]>()
    for (const item of itemsRows) {
      const existing = itemsBySale.get(item.sale_id) ?? []
      existing.push({
        productId: item.product_id,
        productName: item.product_name,
        unitPrice: Number(item.unit_price),
        quantity: Number(item.quantity),
        unit: item.unit,
        category: item.category,
        subtotal: Number(item.subtotal),
      })
      itemsBySale.set(item.sale_id, existing)
    }

    const sales = salesRows.map((sale) => ({
      id: sale.id,
      userId: sale.user_id,
      total: Number(sale.total),
      itemCount: Number(sale.item_count),
      date: sale.date,
      items: itemsBySale.get(sale.id) ?? [],
    }))

    return NextResponse.json(sales)
  } catch (error) {
    console.error("Get sales error:", error)
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const authenticatedUserId = await getAuthenticatedUserId(request)
    if (!authenticatedUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, userId, total, itemCount, date, items } = body

    if (!id || !userId || !Array.isArray(items)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    if (userId !== authenticatedUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const sql = await db()
    await sql`BEGIN`
    try {
      await sql`
        INSERT INTO sales (id, user_id, total, item_count, date)
        VALUES (${id}, ${userId}, ${total}, ${itemCount}, ${date})
      `

      for (const item of items) {
        await sql`
          INSERT INTO sale_items (sale_id, product_id, product_name, unit_price, quantity, unit, category, subtotal)
          VALUES (
            ${id},
            ${item.productId},
            ${item.productName},
            ${item.unitPrice},
            ${item.quantity},
            ${item.unit},
            ${item.category},
            ${item.subtotal}
          )
        `
      }

      for (const item of items) {
        const productRows = await sql`
          SELECT quantity
          FROM products
          WHERE id = ${item.productId} AND user_id = ${userId}
          LIMIT 1
        `
        if (productRows.length === 0) {
          await sql`ROLLBACK`
          return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 })
        }

        const beforeQty = Number(productRows[0].quantity)
        const requestedQty = Number(item.quantity)
        if (!Number.isFinite(requestedQty) || requestedQty <= 0) {
          await sql`ROLLBACK`
          return NextResponse.json({ error: "Invalid item quantity" }, { status: 400 })
        }

        if (beforeQty < requestedQty) {
          await sql`ROLLBACK`
          return NextResponse.json({ error: `Insufficient stock for ${item.productName}` }, { status: 409 })
        }

        const afterQty = beforeQty - requestedQty

        await sql`
          UPDATE products
          SET quantity = ${afterQty}
          WHERE id = ${item.productId} AND user_id = ${userId}
        `

        await sql`
          INSERT INTO inventory_movements (
            user_id,
            product_id,
            reason,
            quantity_change,
            before_quantity,
            after_quantity,
            reference_type,
            reference_id
          )
          VALUES (
            ${userId},
            ${item.productId},
            ${"sale"},
            ${-requestedQty},
            ${beforeQty},
            ${afterQty},
            ${"sale"},
            ${id}
          )
        `
      }

      await sql`COMMIT`

      const ownerRows = await sql`
        SELECT name, email, business_name
        FROM users
        WHERE id = ${userId}
        LIMIT 1
      `

      if (ownerRows.length > 0) {
        const owner = ownerRows[0]
        const ownerEmail = String(owner.email ?? "").trim()
        if (ownerEmail) {
          const reportUrl = buildSalesReportDownloadUrl(String(userId), "today", request.headers.get("origin") ?? undefined)
          const salesPageUrl = buildSalesPageUrl(request.headers.get("origin") ?? undefined)
          const emailResult = await sendSaleNotificationEmail({
            to: ownerEmail,
            recipientName: String(owner.name ?? "Business Owner"),
            businessName: String(owner.business_name ?? "Your Business"),
            saleId: String(id),
            soldAt: new Date(date || new Date().toISOString()).toLocaleString(),
            total: Number(total ?? 0),
            itemCount: Number(itemCount ?? items.length ?? 0),
            items: items.map((item: any) => ({
              productName: String(item.productName ?? "Item"),
              quantity: Number(item.quantity ?? 0),
              subtotal: Number(item.subtotal ?? 0),
            })),
            salesPageUrl,
            reportDownloadUrl: reportUrl,
          })

          if (!emailResult.sent) {
            console.warn("Sale notification email failed:", emailResult.reason)
          }
        }
      }

      return NextResponse.json({ success: true })
    } catch (error) {
      await sql`ROLLBACK`
      throw error
    }
  } catch (error) {
    console.error("Create sale error:", error)
    return NextResponse.json({ error: "Failed to complete sale" }, { status: 500 })
  }
}
