import { SignJWT, jwtVerify } from "jose"

export type ReportFilterType = "today" | "week" | "month" | "custom"

type ReportDownloadTokenPayload = {
  scope: "sales_report_download"
  userId: string
  filterType: ReportFilterType
  periodLabel?: string
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET is not set")
  return new TextEncoder().encode(secret)
}

export async function createReportDownloadToken(payload: ReportDownloadTokenPayload, expiresInSeconds = 60 * 60 * 12) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${expiresInSeconds}s`)
    .sign(getJwtSecret())
}

export async function verifyReportDownloadToken(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecret())
  if (payload.scope !== "sales_report_download") {
    throw new Error("Invalid token scope")
  }
  if (typeof payload.userId !== "string") {
    throw new Error("Invalid token user")
  }
  if (
    payload.filterType !== "today" &&
    payload.filterType !== "week" &&
    payload.filterType !== "month" &&
    payload.filterType !== "custom"
  ) {
    throw new Error("Invalid token filter")
  }

  return {
    userId: payload.userId,
    filterType: payload.filterType as ReportFilterType,
    periodLabel: typeof payload.periodLabel === "string" ? payload.periodLabel : undefined,
  }
}
