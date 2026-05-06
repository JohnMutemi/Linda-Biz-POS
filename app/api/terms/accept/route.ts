import { NextResponse } from "next/server"
import { db } from "@/lib/database"
import { isPasswordHash, verifyPassword } from "@/lib/auth"

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
      SELECT id, password, approval_status, suspended_at, deleted_at
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
    if (!isPasswordHash(user.password)) {
      // No plaintext fallback here intentionally—signup/login upgrades on login.
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const ok = await verifyPassword(password, user.password)
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    await sql`
      UPDATE users
      SET terms_accepted_at = NOW()
      WHERE id = ${user.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Terms accept error:", error)
    return NextResponse.json({ error: "Failed to accept terms" }, { status: 500 })
  }
}

