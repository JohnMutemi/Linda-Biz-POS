import { db } from "@/lib/database"
import { getSessionTokenFromCookieHeader, verifySessionToken } from "@/lib/auth"

export async function getBusinessAdminSession(request: Request) {
  const token = getSessionTokenFromCookieHeader(request.headers.get("cookie"))
  if (!token) return null

  try {
    const session = await verifySessionToken(token)
    if (!session.isBusinessAdminPanel) return null

    const sql = await db()
    const users = await sql`
      SELECT id, email, approval_status, suspended_at, deleted_at
      FROM users
      WHERE id = ${session.userId}
      LIMIT 1
    `

    if (users.length === 0) return null
    const user = users[0]
    if (user.approval_status !== "approved" || user.suspended_at || user.deleted_at) return null

    return {
      userId: String(user.id),
      email: String(user.email),
    }
  } catch {
    return null
  }
}
