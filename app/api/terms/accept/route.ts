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
import { isAdminEmail } from "@/lib/admin"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const email = String(body?.email || "").trim().toLowerCase()
    const password = String(body?.password || "")
    const accepted = Boolean(body?.accepted)

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }
    if (!accepted) {
      return NextResponse.json({ error: "Terms not accepted" }, { status: 400 })
    }

    const sql = await db()
    const users = await sql`
      SELECT id, name, email, phone, business_name, location, user_type, registration_date, password, approval_status, suspended_at, deleted_at
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `
    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const user = users[0]
    if (user.deleted_at) return NextResponse.json({ error: "Account not available." }, { status: 403 })
    if (user.suspended_at) return NextResponse.json({ error: "Account suspended." }, { status: 403 })
    if (user.approval_status !== "approved") {
      return NextResponse.json({ error: "Account not approved." }, { status: 403 })
    }
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
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    await sql`
      UPDATE users
      SET terms_accepted_at = NOW()
      WHERE id = ${user.id}
    `

    const isAdmin = isAdminEmail(user.email)
    const token = await createSessionToken({ userId: user.id, email: user.email, isAdmin })
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
        businessName: user.business_name,
        location: user.location ?? "",
        userType: user.user_type,
        approvalStatus: user.approval_status,
        isAdmin,
        registrationDate: user.registration_date,
      },
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
    console.error("Terms accept error:", error)
    return NextResponse.json({ error: "Failed to accept terms" }, { status: 500 })
  }
}

