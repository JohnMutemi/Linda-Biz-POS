import { NextResponse } from "next/server"
import { db } from "@/lib/database"
import { getBusinessAdminSession } from "@/lib/business-admin-auth"
import { createSessionToken, getSessionCookieName, getSessionMaxAgeSeconds, hashPassword } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await getBusinessAdminSession(request)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const newPassword = String(body?.password || "")
    if (!newPassword) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const sql = await db()
    const nextHash = await hashPassword(newPassword)
    await sql`
      UPDATE users
      SET owner_admin_password = ${nextHash}, owner_admin_must_reset = FALSE
      WHERE id = ${session.userId}
    `

    // Refresh session token so middleware stops forcing reset.
    const token = await createSessionToken({
      userId: session.userId,
      email: session.email,
      isBusinessAdminPanel: true,
      ownerAdminMustReset: false,
    })

    const response = NextResponse.json({ success: true })
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
    console.error("Business admin password update error:", error)
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
  }
}

