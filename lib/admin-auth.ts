import { db } from "@/lib/database"
import { getSessionTokenFromCookieHeader, verifySessionToken } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin"

export async function getAdminSession(request: Request) {
  const token = getSessionTokenFromCookieHeader(request.headers.get("cookie"))
  if (!token) return null

  try {
    const session = await verifySessionToken(token)
    if (!isAdminEmail(session.email)) return null

    const sql = await db()
    const users = await sql`
      SELECT id, email
      FROM users
      WHERE id = ${session.userId}
      LIMIT 1
    `

    if (users.length === 0) return null
    if (!isAdminEmail(users[0].email)) return null

    return {
      userId: session.userId,
      email: users[0].email as string,
    }
  } catch {
    return null
  }
}
