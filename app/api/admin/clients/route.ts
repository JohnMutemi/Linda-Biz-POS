import { NextResponse } from "next/server"
import { db } from "@/lib/database"
import { getAdminSession } from "@/lib/admin-auth"
import { isAdminEmail } from "@/lib/admin"

export async function GET(request: Request) {
  try {
    const admin = await getAdminSession(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sql = await db()
    const clients = await sql`
      SELECT
        id,
        name,
        email,
        phone,
        business_name,
        location,
        user_type,
        registration_date,
        approval_status,
        approved_at,
        approved_by,
        login_route_sent_at
      FROM users
      ORDER BY registration_date DESC
    `

    return NextResponse.json(clients.filter((client) => !isAdminEmail(client.email)).map((client) => ({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone ?? "",
      businessName: client.business_name,
      location: client.location ?? "",
      userType: client.user_type,
      registrationDate: client.registration_date,
      approvalStatus: client.approval_status,
      approvedAt: client.approved_at,
      approvedBy: client.approved_by,
      loginRouteSentAt: client.login_route_sent_at,
    })))
  } catch (error) {
    console.error("Admin clients list error:", error)
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
  }
}
