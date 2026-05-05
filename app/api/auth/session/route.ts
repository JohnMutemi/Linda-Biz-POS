import { NextResponse } from "next/server"
import { db } from "@/lib/database"
import { getSessionTokenFromCookieHeader, verifySessionToken } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const token = getSessionTokenFromCookieHeader(request.headers.get("cookie"))

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decodedToken = decodeURIComponent(token)
    const session = await verifySessionToken(decodedToken)

    const sql = await db()
    const users = await sql`
      SELECT id, name, email, phone, business_name, location, user_type, registration_date
      FROM users
      WHERE id = ${session.userId}
      LIMIT 1
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = users[0]
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
      businessName: user.business_name,
      location: user.location ?? "",
      userType: user.user_type,
      registrationDate: user.registration_date,
    })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
