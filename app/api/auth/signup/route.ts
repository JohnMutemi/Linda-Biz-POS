import { NextResponse } from "next/server"
import { db } from "@/lib/database"
import { hashPassword } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, phone, businessName, location } = body

    if (!name || !email || !password || !businessName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const sql = await db()
    const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`

    if (existing.length > 0) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 })
    }

    const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const registrationDate = new Date().toISOString()

    const passwordHash = await hashPassword(password)

    await sql`
      INSERT INTO users (id, name, email, password, phone, business_name, location, user_type, registration_date)
      VALUES (
        ${id},
        ${name},
        ${email},
        ${passwordHash},
        ${phone ?? null},
        ${businessName},
        ${location ?? null},
        ${"general"},
        ${registrationDate}
      )
    `

    return NextResponse.json({
      id,
      name,
      email,
      phone: phone ?? "",
      businessName,
      location: location ?? "",
      userType: "general",
      isNewUser: true,
      registrationDate,
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
  }
}
