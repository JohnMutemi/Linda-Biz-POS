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
      SELECT id, name, price, quantity, unit, category, user_type, user_id
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
    const { id, name, price, quantity, unit, category, userType, userId } = body

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
    await sql`
      INSERT INTO products (id, name, price, quantity, unit, category, user_type, user_id)
      VALUES (${id}, ${name}, ${Number(price)}, ${Number(quantity)}, ${unit}, ${category}, ${userType}, ${userId})
    `

    return NextResponse.json({ success: true })
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
    const { id, name, price, quantity, unit, category, userType, userId } = body

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
    await sql`
      UPDATE products
      SET
        name = ${name},
        price = ${Number(price)},
        quantity = ${Number(quantity)},
        unit = ${unit},
        category = ${category},
        user_type = ${userType}
      WHERE id = ${id} AND user_id = ${userId}
    `

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
    await sql`DELETE FROM products WHERE id = ${id} AND user_id = ${userId}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete product error:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
