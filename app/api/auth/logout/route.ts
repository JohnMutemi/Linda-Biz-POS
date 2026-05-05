import { NextResponse } from "next/server"
import { getSessionCookieName } from "@/lib/auth"

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set({
    name: getSessionCookieName(),
    value: "",
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  })
  return response
}
