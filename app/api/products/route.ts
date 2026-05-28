import { NextResponse } from "next/server"
import { db } from "@/lib/database"
import { getSessionTokenFromCookieHeader, verifySessionToken } from "@/lib/auth"
import { buildProductsPageUrl, sendProductChangeEmail } from "@/lib/mailer"

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

async function notifyOwnerProductChange(args: {
  request: Request
  userId: string
  changeType: "created" | "updated" | "deleted" | "merged" | "adjusted"
  before?: {
    id: string
    name: string
    category?: string
    unit?: string
    price?: number
    quantity?: number
    reorderLevel?: number
  }
  after?: {
    id: string
    name: string
    category?: string
    unit?: string
    price?: number
    quantity?: number
    reorderLevel?: number
  }
}) {
  try {
    const sql = await db()
    const ownerRows = await sql`
      SELECT name, email, business_name
      FROM users
      WHERE id = ${args.userId}
      LIMIT 1
    `
    if (ownerRows.length === 0) return
    const owner = ownerRows[0]
    const ownerEmail = String(owner.email ?? "").trim()
    if (!ownerEmail) return

    const productsPageUrl = buildProductsPageUrl(args.request.headers.get("origin") ?? undefined)
    const result = await sendProductChangeEmail({
      to: ownerEmail,
      recipientName: String(owner.name ?? "Business Owner"),
      businessName: String(owner.business_name ?? "Your Business"),
      changeType: args.changeType,
      changedAt: new Date().toLocaleString(),
      before: args.before,
      after: args.after,
      productsPageUrl,
    })
    if (!result.sent) {
      console.warn("Product change email failed:", result.reason)
    }
  } catch (e) {
    console.warn("Product change notify error:", e)
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
    const rows = await sql`
      SELECT id, name, price, quantity, unit, category, description, reorder_level, user_type, user_id
      FROM products
      WHERE user_id = ${userId}
      ORDER BY name ASC
    `

    const products = rows.map((p) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      quantity: Number(p.quantity),
      unit: p.unit,
      category: p.category,
      description: p.description ?? "",
      reorderLevel: Number(p.reorder_level ?? 5),
      userType: p.user_type,
      userId: p.user_id,
    }))

    return NextResponse.json(products)
  } catch (error) {
    console.error("Get products error:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const authenticatedUserId = await getAuthenticatedUserId(request)
    if (!authenticatedUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, price, quantity, unit, category, description, reorderLevel, userType, userId } = body

    if (!id || !name || !unit || !category || !userType || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    if (!Number.isFinite(Number(price)) || Number(price) < 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 })
    }
    if (!Number.isFinite(Number(quantity)) || Number(quantity) < 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 })
    }
    if (userId !== authenticatedUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const sql = await db()
    const addQty = Number(quantity)
    const reorder = Number.isFinite(Number(reorderLevel)) ? Number(reorderLevel) : 5

    await sql`BEGIN`
    try {
      const dupRows = await sql`
        SELECT id, quantity FROM products
        WHERE user_id = ${userId}
          AND LOWER(TRIM(name)) = LOWER(TRIM(${String(name)}))
        LIMIT 1
      `
      const existing = dupRows[0]

      if (existing) {
        const existingId = existing.id as string
        const beforeQty = Number(existing.quantity)
        const afterQty = beforeQty + addQty

        await sql`
          UPDATE products
          SET
            quantity = ${afterQty},
            price = ${Number(price)},
            unit = ${unit},
            category = ${category},
            description = ${typeof description === "string" ? description : null},
            reorder_level = ${reorder},
            user_type = ${userType}
          WHERE id = ${existingId} AND user_id = ${userId}
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
            ${existingId},
            ${"merge"},
            ${addQty},
            ${beforeQty},
            ${afterQty},
            ${"product"},
            ${existingId}
          )
        `
        await sql`
          INSERT INTO business_activity_logs (user_id, action, entity_type, entity_id, note)
          VALUES (${userId}, ${"product_edited"}, ${"product"}, ${existingId}, ${"Merged quantity into existing product."})
        `
        await sql`COMMIT`
        await notifyOwnerProductChange({
          request,
          userId: String(userId),
          changeType: "merged",
          before: {
            id: existingId,
            name: String(name),
            category: String(category),
            unit: String(unit),
            price: Number(price),
            quantity: beforeQty,
            reorderLevel: reorder,
          },
          after: {
            id: existingId,
            name: String(name),
            category: String(category),
            unit: String(unit),
            price: Number(price),
            quantity: afterQty,
            reorderLevel: reorder,
          },
        })
        return NextResponse.json({ success: true, merged: true, productId: existingId })
      }

      await sql`
        INSERT INTO products (id, name, price, quantity, unit, category, description, reorder_level, user_type, user_id)
        VALUES (
          ${id},
          ${name},
          ${Number(price)},
          ${addQty},
          ${unit},
          ${category},
          ${typeof description === "string" ? description : null},
          ${reorder},
          ${userType},
          ${userId}
        )
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
          ${id},
          ${"create"},
          ${addQty},
          ${0},
          ${addQty},
          ${"product"},
          ${id}
        )
      `
      await sql`
        INSERT INTO business_activity_logs (user_id, action, entity_type, entity_id, note)
        VALUES (${userId}, ${"product_created"}, ${"product"}, ${id}, ${"Created new product."})
      `
      await sql`COMMIT`
    } catch (error) {
      await sql`ROLLBACK`
      throw error
    }

    await notifyOwnerProductChange({
      request,
      userId: String(userId),
      changeType: "created",
      after: {
        id: String(id),
        name: String(name),
        category: String(category),
        unit: String(unit),
        price: Number(price),
        quantity: Number(addQty),
        reorderLevel: Number.isFinite(Number(reorderLevel)) ? Number(reorderLevel) : 5,
      },
    })
    return NextResponse.json({ success: true, merged: false })
  } catch (error) {
    console.error("Create product error:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const authenticatedUserId = await getAuthenticatedUserId(request)
    if (!authenticatedUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, price, quantity, unit, category, description, reorderLevel, userType, userId } = body

    if (!id || !userId) {
      return NextResponse.json({ error: "id and userId are required" }, { status: 400 })
    }
    if (price != null && (!Number.isFinite(Number(price)) || Number(price) < 0)) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 })
    }
    if (quantity != null && (!Number.isFinite(Number(quantity)) || Number(quantity) < 0)) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 })
    }
    if (userId !== authenticatedUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const sql = await db()
    await sql`BEGIN`
    try {
      const existingRows = await sql`
        SELECT name, price, quantity, unit, category, reorder_level
        FROM products
        WHERE id = ${id} AND user_id = ${userId}
        LIMIT 1
      `
      if (existingRows.length === 0) {
        await sql`ROLLBACK`
        return NextResponse.json({ error: "Product not found" }, { status: 404 })
      }

      const before = {
        id: String(id),
        name: String(existingRows[0].name ?? ""),
        category: String(existingRows[0].category ?? ""),
        unit: String(existingRows[0].unit ?? ""),
        price: Number(existingRows[0].price),
        quantity: Number(existingRows[0].quantity),
        reorderLevel: Number(existingRows[0].reorder_level ?? 5),
      }
      const beforeQty = Number(existingRows[0].quantity)
      const nextQty = Number(quantity)
      const qtyDelta = nextQty - beforeQty
      const nextReorderLevel = Number.isFinite(Number(reorderLevel))
        ? Number(reorderLevel)
        : Number(existingRows[0].reorder_level ?? 5)

      if (qtyDelta > 0 && nextQty <= nextReorderLevel) {
        await sql`ROLLBACK`
        return NextResponse.json(
          { error: `Restock must bring stock above reorder level (${nextReorderLevel}).` },
          { status: 400 },
        )
      }

      await sql`
        UPDATE products
        SET
          name = ${name},
          price = ${Number(price)},
          quantity = ${nextQty},
          unit = ${unit},
          category = ${category},
          description = ${typeof description === "string" ? description : null},
          reorder_level = ${nextReorderLevel},
          user_type = ${userType}
        WHERE id = ${id} AND user_id = ${userId}
      `

      const reason = qtyDelta === 0 ? "update" : qtyDelta > 0 ? "restock" : "adjustment"
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
          ${id},
          ${reason},
          ${qtyDelta},
          ${beforeQty},
          ${nextQty},
          ${"product"},
          ${id}
        )
      `
      await sql`
        INSERT INTO business_activity_logs (user_id, action, entity_type, entity_id, note)
        VALUES (${userId}, ${"product_edited"}, ${"product"}, ${id}, ${"Updated product details."})
      `

      await sql`COMMIT`
      await notifyOwnerProductChange({
        request,
        userId: String(userId),
        changeType: qtyDelta !== 0 ? "adjusted" : "updated",
        before,
        after: {
          id: String(id),
          name: String(name ?? before.name),
          category: String(category ?? before.category),
          unit: String(unit ?? before.unit),
          price: Number(price ?? before.price),
          quantity: Number(nextQty),
          reorderLevel: Number(nextReorderLevel),
        },
      })
    } catch (error) {
      await sql`ROLLBACK`
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update product error:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const authenticatedUserId = await getAuthenticatedUserId(request)
    if (!authenticatedUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const userId = searchParams.get("userId")

    if (!id || !userId) {
      return NextResponse.json({ error: "id and userId are required" }, { status: 400 })
    }
    if (userId !== authenticatedUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const sql = await db()
    const beforeRows = await sql`
      SELECT id, name, price, quantity, unit, category, reorder_level
      FROM products
      WHERE id = ${id} AND user_id = ${userId}
      LIMIT 1
    `
    if (beforeRows.length > 0) {
      await sql`
        INSERT INTO business_activity_logs (user_id, action, entity_type, entity_id, note)
        VALUES (${userId}, ${"product_deleted"}, ${"product"}, ${id}, ${"Deleted product from inventory."})
      `
    }
    await sql`DELETE FROM products WHERE id = ${id} AND user_id = ${userId}`
    const before =
      beforeRows.length > 0
        ? {
            id: String(beforeRows[0].id),
            name: String(beforeRows[0].name ?? ""),
            category: String(beforeRows[0].category ?? ""),
            unit: String(beforeRows[0].unit ?? ""),
            price: Number(beforeRows[0].price),
            quantity: Number(beforeRows[0].quantity),
            reorderLevel: Number(beforeRows[0].reorder_level ?? 5),
          }
        : undefined
    await notifyOwnerProductChange({ request, userId: String(userId), changeType: "deleted", before })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete product error:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
