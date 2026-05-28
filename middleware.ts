import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const SESSION_COOKIE_NAME = "lindabiz_session"

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET is not set")
  }
  return new TextEncoder().encode(secret)
}

// This middleware protects all routes under /dashboard, /products, /sales, /settings, and /profile
export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get(getSessionCookieName())?.value
  let isAuthenticated = false
  let isAdmin = false
  let isBusinessAdminPanel = false
  let ownerAdminMustReset = false

  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, getJwtSecret())
      isAuthenticated = true
      isAdmin = payload.isAdmin === true
      isBusinessAdminPanel = payload.isBusinessAdminPanel === true
      ownerAdminMustReset = payload.ownerAdminMustReset === true
    } catch {
      isAuthenticated = false
      isAdmin = false
      isBusinessAdminPanel = false
      ownerAdminMustReset = false
    }
  }

  const pathname = request.nextUrl.pathname
  const isAdminLoginRoute = pathname === "/admin/login"
  const isBusinessAdminLoginRoute = pathname === "/business-admin/login"
  const isBusinessAdminResetRoute = pathname === "/business-admin/reset-password"
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/sales") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/profile")
  const isAdminRoute = pathname.startsWith("/admin") && !isAdminLoginRoute
  const isBusinessAdminRoute = pathname.startsWith("/business-admin") && !isBusinessAdminLoginRoute && !isBusinessAdminResetRoute

  // If the user is not logged in and trying to access protected routes, redirect to login
  if (!isAuthenticated && (isProtectedRoute || isAdminRoute || isBusinessAdminRoute)) {
    return NextResponse.redirect(
      new URL(isAdminRoute ? "/admin/login" : isBusinessAdminRoute ? "/business-admin/login" : "/login", request.url),
    )
  }

  // Force password reset for business-admin accounts on first login (or when re-issued).
  if (isAuthenticated && isBusinessAdminPanel && ownerAdminMustReset && pathname.startsWith("/business-admin") && !isBusinessAdminResetRoute) {
    return NextResponse.redirect(new URL("/business-admin/reset-password", request.url))
  }
  if (isAdminLoginRoute && isAuthenticated && isAdmin) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }
  if (isBusinessAdminLoginRoute && isAuthenticated && isBusinessAdminPanel) {
    return NextResponse.redirect(new URL("/business-admin", request.url))
  }
  if (isProtectedRoute && isAdmin) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }
  if (isProtectedRoute && isBusinessAdminPanel) {
    return NextResponse.redirect(new URL("/business-admin", request.url))
  }
  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL(isBusinessAdminPanel ? "/business-admin" : "/dashboard", request.url))
  }
  if (isBusinessAdminRoute && !isBusinessAdminPanel) {
    return NextResponse.redirect(new URL(isAdmin ? "/admin" : "/dashboard", request.url))
  }

  return NextResponse.next()
}

function getSessionCookieName() {
  return SESSION_COOKIE_NAME
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/products/:path*",
    "/sales/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/business-admin/:path*",
  ],
}
