import { SignJWT, jwtVerify } from "jose"
import { hash, compare } from "bcryptjs"

const SESSION_COOKIE_NAME = "lindabiz_session"
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 // 24 hours

export type SessionPayload = {
  userId: string
  email: string
  isAdmin?: boolean
  isBusinessAdminPanel?: boolean
  ownerAdminMustReset?: boolean
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET is not set")
  }
  return new TextEncoder().encode(secret)
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME
}

export function getSessionMaxAgeSeconds() {
  return SESSION_MAX_AGE_SECONDS
}

export function isPasswordHash(value: string) {
  return value.startsWith("$2a$") || value.startsWith("$2b$") || value.startsWith("$2y$")
}

export async function hashPassword(password: string) {
  return hash(password, 12)
}

export async function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash)
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getJwtSecret())
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecret())
  const userId = payload.userId
  const email = payload.email
  const isAdmin = payload.isAdmin
  const isBusinessAdminPanel = payload.isBusinessAdminPanel
  const ownerAdminMustReset = payload.ownerAdminMustReset

  if (typeof userId !== "string" || typeof email !== "string") {
    throw new Error("Invalid token payload")
  }

  return {
    userId,
    email,
    isAdmin: isAdmin === true,
    isBusinessAdminPanel: isBusinessAdminPanel === true,
    ownerAdminMustReset: ownerAdminMustReset === true,
  }
}

export function getSessionTokenFromCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) return null

  const parts = cookieHeader.split(";").map((part) => part.trim())
  const target = `${SESSION_COOKIE_NAME}=`
  const match = parts.find((part) => part.startsWith(target))
  if (!match) return null
  return decodeURIComponent(match.slice(target.length))
}
