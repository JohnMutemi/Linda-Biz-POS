import { createHash } from "crypto"
import { NextResponse } from "next/server"
import { db } from "@/lib/database"
import { hashPassword } from "@/lib/auth"

function sha256Hex(value: string) {
  return createHash("sha256").update(value).digest("hex")
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const email = String(body?.email || "").trim().toLowerCase()
    const token = String(body?.token || "").trim()
    const newPassword = String(body?.password || "")

    if (!email || !token || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const sql = await db()
    const users = await sql`
      SELECT id, password_reset_token_hash, password_reset_expires_at
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `
    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 })
    }

    const user = users[0]
    const expectedHash = user.password_reset_token_hash as string | null
    const expiresAtRaw = user.password_reset_expires_at as string | null
    const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null
    if (!expectedHash || !expiresAt || Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: "Token expired" }, { status: 400 })
    }

    const providedHash = sha256Hex(token)
    if (providedHash !== expectedHash) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 })
    }

    const nextHash = await hashPassword(newPassword)
    await sql`
      UPDATE users
      SET
        password = ${nextHash},
        password_reset_token_hash = NULL,
        password_reset_expires_at = NULL
      WHERE id = ${user.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Password reset confirm error:", error)
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
  }
}

