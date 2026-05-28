import { NextResponse } from "next/server"
import { getBusinessAdminSession } from "@/lib/business-admin-auth"

export async function GET(request: Request) {
  const session = await getBusinessAdminSession(request)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  const nextParams = new URLSearchParams({
    userId: session.userId,
    filterType: "custom",
  })
  if (from) nextParams.set("startDate", from)
  if (to) nextParams.set("endDate", to)
  if (from && to) nextParams.set("periodLabel", `${from} to ${to}`)

  return NextResponse.redirect(new URL(`/api/sales/report/pdf?${nextParams.toString()}`, request.url))
}

