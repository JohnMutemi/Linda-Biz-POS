import { createHash, randomBytes } from "crypto"
import { NextResponse } from "next/server"
import { db } from "@/lib/database"
import { buildBusinessAdminPasswordResetUrl, sendBusinessAdminPasswordResetEmail } from "@/lib/mailer"

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
      SELECT
        id,
        name,
        email,
        approval_status,
        suspended_at,
        deleted_at,
        owner_admin_email,
        owner_admin_password
      FROM users
      WHERE LOWER(COALESCE(owner_admin_email, email)) = ${email}
      LIMIT 1
    `

    // Always return success to prevent account enumeration.
    if (users.length === 0) {
      return NextResponse.json({ success: true })
    }

    const user = users[0]
    if (user.approval_status !== "approved" || user.suspended_at || user.deleted_at || !user.owner_admin_password) {
      return NextResponse.json({ success: true })
    }

    const token = randomBytes(32).toString("hex")
    const tokenHash = sha256Hex(token)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await sql`
      UPDATE users
      SET
        owner_admin_password_reset_token_hash = ${tokenHash},
        owner_admin_password_reset_expires_at = ${expiresAt.toISOString()}
      WHERE id = ${user.id}
    `

    const resetUrl = buildBusinessAdminPasswordResetUrl(token, email, requestOrigin)
    await sendBusinessAdminPasswordResetEmail({
      to: email,
      recipientName: user.name as string,
      resetUrl,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Business admin password reset request error:", error)
    return NextResponse.json({ success: true })
  }
}
