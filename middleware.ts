import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifySessionToken, getSessionCookieName } from "@/lib/auth"

// This middleware protects all routes under /dashboard, /products, /sales, /settings, and /profile
export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get(getSessionCookieName())?.value
  let isAuthenticated = false

  if (sessionCookie) {
    try {
      await verifySessionToken(sessionCookie)
      isAuthenticated = true
    } catch {
      isAuthenticated = false
    }
  }

  // If the user is not logged in and trying to access protected routes, redirect to login
  if (
    !isAuthenticated &&
    (request.nextUrl.pathname.startsWith("/dashboard") ||
      request.nextUrl.pathname.startsWith("/products") ||
      request.nextUrl.pathname.startsWith("/sales") ||
      request.nextUrl.pathname.startsWith("/settings") ||
      request.nextUrl.pathname.startsWith("/profile"))
  ) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/products/:path*", "/sales/:path*", "/settings/:path*", "/profile/:path*"],
}
