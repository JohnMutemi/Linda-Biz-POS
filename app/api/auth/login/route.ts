import { NextResponse } from "next/server"
import { db } from "@/lib/database"
import {
  createSessionToken,
  getSessionCookieName,
  getSessionMaxAgeSeconds,
  isPasswordHash,
  verifyPassword,
  hashPassword,
} from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const sql = await db()
    const users = await sql`
      SELECT id, name, email, password, phone, business_name, location, user_type, registration_date
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const user = users[0]
    let isValidPassword = false

    if (isPasswordHash(user.password)) {
      isValidPassword = await verifyPassword(password, user.password)
    } else {
      // Backward compatibility for previously stored plaintext passwords.
      isValidPassword = user.password === password
      if (isValidPassword) {
        const upgradedHash = await hashPassword(password)
        await sql`UPDATE users SET password = ${upgradedHash} WHERE id = ${user.id}`
      }
    }

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const token = await createSessionToken({ userId: user.id, email: user.email })
    const response = NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
      businessName: user.business_name,
      location: user.location ?? "",
      userType: user.user_type,
      registrationDate: user.registration_date,
    })

    response.cookies.set({
      name: getSessionCookieName(),
      value: token,
      httpOnly: true,
      sameSite: "strict",
      path: "/",
      maxAge: getSessionMaxAgeSeconds(),
      secure: process.env.NODE_ENV === "production",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Failed to login" }, { status: 500 })
  }
}
