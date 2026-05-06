import { randomBytes } from "crypto"
import { NextResponse } from "next/server"
import { db } from "@/lib/database"
import { getAdminSession } from "@/lib/admin-auth"
import { buildLoginUrl, sendLoginRouteEmail } from "@/lib/mailer"

type ActionType = "approve" | "reject" | "send-login-route" | "suspend" | "unsuspend" | "delete"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ clientId: string }> },
) {
  try {
    const requestOrigin = new URL(request.url).origin
    const admin = await getAdminSession(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { clientId } = await params
    const body = await request.json()
    const action = body?.action as ActionType | undefined

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 })
    }

    const sql = await db()
    const users = await sql`
      SELECT id, name, email, approval_status, login_route_token, suspended_at, deleted_at
      FROM users
      WHERE id = ${clientId}
      LIMIT 1
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const client = users[0]
    const insertAuditLog = async (auditAction: string, note?: string) => {
      await sql`
        INSERT INTO admin_audit_logs (client_id, admin_email, action, note)
        VALUES (${clientId}, ${admin.email}, ${auditAction}, ${note ?? null})
      `
    }

    if (action === "approve") {
      const token = client.login_route_token || randomBytes(24).toString("hex")
      const loginUrl = buildLoginUrl(token, client.email, requestOrigin)
      const emailResult = await sendLoginRouteEmail({
        to: client.email,
        recipientName: client.name,
        loginUrl,
      })

      await sql`
        UPDATE users
        SET
          approval_status = ${"approved"},
          approved_at = NOW(),
          approved_by = ${admin.email},
          login_route_token = ${token},
          login_route_sent_at = NOW(),
          terms_accepted_at = NULL
        WHERE id = ${clientId}
      `
      await insertAuditLog(
        "approve",
        emailResult.sent ? "Client approved and login route email sent." : `Client approved. Email failed: ${emailResult.reason}`,
      )
      await insertAuditLog("send-login-route", emailResult.sent ? "Login route sent on approval." : "Login route generated on approval.")

      return NextResponse.json({
        success: true,
        message: emailResult.sent
          ? "Client approved and login route sent to client email."
          : "Client approved. Email provider is not configured, login route was generated for manual sharing.",
        emailSent: emailResult.sent,
        emailIssue: emailResult.sent ? null : emailResult.reason,
        loginUrl,
      })
    }

    if (action === "reject") {
      await sql`
        UPDATE users
        SET approval_status = ${"rejected"}, approved_at = NULL, approved_by = ${admin.email}
        WHERE id = ${clientId}
      `
      await insertAuditLog("reject", "Client registration rejected.")

      return NextResponse.json({ success: true, message: "Client rejected" })
    }

    if (action === "suspend") {
      const body = await request.json().catch(() => ({}))
      const reason = typeof body?.reason === "string" ? body.reason.slice(0, 500) : ""
      await sql`
        UPDATE users
        SET suspended_at = NOW(), suspended_reason = ${reason || "Policy violation"}
        WHERE id = ${clientId}
      `
      await insertAuditLog("suspend", reason || "Account suspended.")
      return NextResponse.json({ success: true, message: "Client suspended" })
    }

    if (action === "unsuspend") {
      await sql`
        UPDATE users
        SET suspended_at = NULL, suspended_reason = NULL
        WHERE id = ${clientId}
      `
      await insertAuditLog("unsuspend", "Account unsuspended.")
      return NextResponse.json({ success: true, message: "Client unsuspended" })
    }

    if (action === "delete") {
      const body = await request.json().catch(() => ({}))
      const reason = typeof body?.reason === "string" ? body.reason.slice(0, 500) : ""
      await sql`
        UPDATE users
        SET deleted_at = NOW()
        WHERE id = ${clientId}
      `
      await insertAuditLog("delete", reason || "Account deleted (soft delete).")
      return NextResponse.json({ success: true, message: "Client deleted" })
    }

    if (client.approval_status !== "approved") {
      return NextResponse.json({ error: "Client must be approved first." }, { status: 400 })
    }

    const token = client.login_route_token || randomBytes(24).toString("hex")
    const loginUrl = buildLoginUrl(token, client.email, requestOrigin)

    const emailResult = await sendLoginRouteEmail({
      to: client.email,
      recipientName: client.name,
      loginUrl,
    })

    await sql`
      UPDATE users
      SET login_route_token = ${token}, login_route_sent_at = NOW()
      WHERE id = ${clientId}
    `
    await insertAuditLog(
      "send-login-route",
      emailResult.sent ? "Login route sent manually by admin." : "Login route generated manually by admin.",
    )

    return NextResponse.json({
      success: true,
      message: emailResult.sent
        ? "Login route sent to client email."
        : "Client approved login route generated. Email provider is not configured.",
      emailSent: emailResult.sent,
      emailIssue: emailResult.sent ? null : emailResult.reason,
      loginUrl,
    })
  } catch (error) {
    console.error("Admin client action error:", error)
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
  }
}
