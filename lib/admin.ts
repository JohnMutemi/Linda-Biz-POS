const EMAIL_ENV_KEYS = [
  "ADMIN_EMAILS",
  "APPROVED_CLIENT_EMAILS",
  "APPROVED_CLIENT_EMAIL",
  "ADMIN_EMAIL",
] as const

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

function splitEmails(raw: string) {
  return raw
    .split(/[,\s;]+/)
    .map((email) => normalizeEmail(email))
    .filter(Boolean)
}

export function getAdminEmails() {
  const emails = new Set<string>()

  for (const key of EMAIL_ENV_KEYS) {
    const raw = process.env[key]
    if (!raw) continue
    for (const email of splitEmails(raw)) {
      emails.add(email)
    }
  }

  return emails
}

export function isAdminEmail(email: string) {
  if (!email) return false
  return getAdminEmails().has(normalizeEmail(email))
}
