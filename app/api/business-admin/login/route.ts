import { NextResponse } from "next/server"
import { db } from "@/lib/database"
import {
  createSessionToken,
  getSessionCookieName,
  getSessionMaxAgeSeconds,
  isPasswordHash,
  verifyPassword,
} from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body ?? {}

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const sql = await db()
    const users = await sql`
      SELECT
        id,
        name,
        email,
        business_name,
        approval_status,
        suspended_at,
        deleted_at,
        owner_admin_email,
        owner_admin_password,
        owner_admin_must_reset
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid business admin credentials" }, { status: 401 })
    }

    const user = users[0]
    if (user.approval_status !== "approved" || user.suspended_at || user.deleted_at) {
      return NextResponse.json({ error: "Account is not available for business admin login." }, { status: 403 })
    }
    if (!user.owner_admin_password) {
      return NextResponse.json({ error: "Business admin access has not been provisioned yet." }, { status: 403 })
    }
    if (String(user.owner_admin_email || user.email).toLowerCase() !== String(email).toLowerCase()) {
      return NextResponse.json({ error: "Invalid business admin credentials" }, { status: 401 })
    }

    let valid = false
    if (isPasswordHash(String(user.owner_admin_password))) {
      valid = await verifyPassword(password, String(user.owner_admin_password))
    }
    if (!valid) {
      return NextResponse.json({ error: "Invalid business admin credentials" }, { status: 401 })
    }

    const token = await createSessionToken({
      userId: String(user.id),
      email: String(user.email),
      isBusinessAdminPanel: true,
      ownerAdminMustReset: user.owner_admin_must_reset === true,
    })

    const response = NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      businessName: user.business_name,
      isBusinessAdminPanel: true,
      ownerAdminMustReset: user.owner_admin_must_reset === true,
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
    console.error("Business admin login error:", error)
    return NextResponse.json({ error: "Failed to login" }, { status: 500 })
  }
}
