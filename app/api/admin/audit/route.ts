import { NextResponse } from "next/server"
import { db } from "@/lib/database"
import { getAdminSession } from "@/lib/admin-auth"

export async function GET(request: Request) {
  try {
    const admin = await getAdminSession(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1)
    const pageSizeRaw = Number(searchParams.get("pageSize") ?? "20") || 20
    const pageSize = Math.min(100, Math.max(5, pageSizeRaw))
    const offset = (page - 1) * pageSize
    const action = (searchParams.get("action") ?? "").trim()
    const adminEmail = (searchParams.get("adminEmail") ?? "").trim().toLowerCase()
    const from = (searchParams.get("from") ?? "").trim()
    const to = (searchParams.get("to") ?? "").trim()

    const sql = await db()
    const logs = await sql`
      SELECT
        l.id,
        l.client_id,
        l.admin_email,
        l.action,
        l.note,
        l.created_at,
        u.name AS client_name,
        u.email AS client_email
      FROM admin_audit_logs l
      LEFT JOIN users u ON u.id = l.client_id
      ORDER BY l.created_at DESC
      LIMIT 1000
    `

    const actionRows = await sql`
      SELECT DISTINCT action
      FROM admin_audit_logs
      ORDER BY action ASC
    `

    const adminRows = await sql`
      SELECT DISTINCT admin_email
      FROM admin_audit_logs
      ORDER BY admin_email ASC
    `

    const fromDate = from ? new Date(from) : null
    const toDate = to ? new Date(to) : null
    const filteredLogs = logs.filter((log) => {
      if (action && log.action !== action) return false
      if (adminEmail && String(log.admin_email).toLowerCase() !== adminEmail) return false

      const createdAt = new Date(log.created_at as string)
      if (fromDate && !Number.isNaN(fromDate.getTime()) && createdAt < fromDate) return false
      if (toDate && !Number.isNaN(toDate.getTime()) && createdAt > toDate) return false
      return true
    })

    const total = filteredLogs.length
    const items = filteredLogs.slice(offset, offset + pageSize)

    return NextResponse.json({
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      actions: actionRows.map((row) => row.action),
      admins: adminRows.map((row) => row.admin_email),
      items: items.map((log) => ({
        id: log.id,
        clientId: log.client_id,
        clientName: log.client_name ?? "Unknown client",
        clientEmail: log.client_email ?? "",
        adminEmail: log.admin_email,
        action: log.action,
        note: log.note ?? "",
        createdAt: log.created_at,
      })),
    })
  } catch (error) {
    console.error("Admin audit log error:", error)
    return NextResponse.json({ error: "Failed to fetch audit history" }, { status: 500 })
  }
}
