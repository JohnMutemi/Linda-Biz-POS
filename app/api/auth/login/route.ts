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
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const sql = await db()
    const users = await sql`
      SELECT
        id,
        name,
        email,
        password,
        phone,
        business_name,
        location,
        user_type,
        registration_date,
        approval_status,
        terms_accepted_at,
        suspended_at,
        deleted_at
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
    const isAdmin = isAdminEmail(user.email)
    if (!isAdmin && user.deleted_at) {
      return NextResponse.json({ error: "Account not available." }, { status: 403 })
    }
    if (!isAdmin && user.suspended_at) {
      return NextResponse.json({ error: "Account suspended. Please contact support." }, { status: 403 })
    }
    if (!isAdmin && user.approval_status !== "approved") {
      return NextResponse.json(
        { error: "Your registration is pending admin approval. Please wait for your login access email." },
        { status: 403 },
      )
    }

    if (!isAdmin && !user.terms_accepted_at) {
      return NextResponse.json(
        {
          error: "Terms acceptance required.",
          requiresTerms: true,
          email: user.email,
        },
        { status: 428 },
      )
    }

    const token = await createSessionToken({ userId: user.id, email: user.email, isAdmin })
    const response = NextResponse.json({
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
