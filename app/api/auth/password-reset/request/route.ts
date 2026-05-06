import { createHash, randomBytes } from "crypto"
import { NextResponse } from "next/server"
import { db } from "@/lib/database"
import { buildPasswordResetUrl, sendPasswordResetEmail } from "@/lib/mailer"

function sha256Hex(value: string) {
  return createHash("sha256").update(value).digest("hex")
}

export async function POST(request: Request) {
  try {
    const requestOrigin = new URL(request.url).origin
    const body = await request.json().catch(() => null)
    const email = String(body?.email || "").trim().toLowerCase()
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const sql = await db()
    const users = await sql`
      SELECT id, name, email
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `

    // Always return success to prevent account enumeration.
    if (users.length === 0) {
      return NextResponse.json({ success: true })
    }

    const user = users[0]
    const token = randomBytes(32).toString("hex")
    const tokenHash = sha256Hex(token)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await sql`
      UPDATE users
      SET password_reset_token_hash = ${tokenHash}, password_reset_expires_at = ${expiresAt.toISOString()}
      WHERE id = ${user.id}
    `

    const resetUrl = buildPasswordResetUrl(token, email, requestOrigin)
    await sendPasswordResetEmail({
      to: email,
      recipientName: user.name as string,
      resetUrl,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Password reset request error:", error)
    return NextResponse.json({ success: true })
  }
}

