const { neon } = require("@neondatabase/serverless")
const bcrypt = require("bcryptjs")
const fs = require("fs")
const path = require("path")

function loadDotEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return
  const raw = fs.readFileSync(filePath, "utf8")
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const idx = trimmed.indexOf("=")
    if (idx <= 0) continue
    const key = trimmed.slice(0, idx).trim()
    let value = trimmed.slice(idx + 1).trim()
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

const root = process.cwd()
loadDotEnvFile(path.join(root, ".env.local"))
loadDotEnvFile(path.join(root, ".env"))

function isPasswordHash(value) {
  return value.startsWith("$2a$") || value.startsWith("$2b$") || value.startsWith("$2y$")
}

async function main() {
  const emailsRaw = [
    process.env.ADMIN_EMAILS,
    process.env.APPROVED_CLIENT_EMAILS,
    process.env.APPROVED_CLIENT_EMAIL,
    process.env.ADMIN_EMAIL,
  ]
    .filter(Boolean)
    .join(",")

  const emails = [...new Set(emailsRaw.split(/[\s,;]+/).map((email) => email.trim().toLowerCase()).filter(Boolean))]

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set")
  }
  if (emails.length === 0) {
    console.log("No admin emails configured in ADMIN_EMAILS or related env keys.")
    return
  }

  const password = process.env.ADMIN_DEFAULT_PASSWORD
  const name = process.env.ADMIN_DEFAULT_NAME || "System Admin"
  const business = process.env.ADMIN_DEFAULT_BUSINESS || "LindaBiz Administration"
  const sql = neon(process.env.DATABASE_URL)

  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'pending'`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_by TEXT`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS login_route_token TEXT`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS login_route_sent_at TIMESTAMPTZ`

  let created = 0
  let updated = 0
  for (const email of emails) {
    const existing = await sql`
      SELECT id, password
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `

    if (existing.length === 0) {
      if (!password) {
        console.log(`Skipped ${email}: ADMIN_DEFAULT_PASSWORD missing for first-time seed.`)
        continue
      }

      const id = `admin_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      const hash = await bcrypt.hash(password, 12)
      await sql`
        INSERT INTO users (
          id,
          name,
          email,
          password,
          business_name,
          user_type,
          registration_date,
          approval_status,
          approved_at,
          approved_by
        )
        VALUES (
          ${id},
          ${name},
          ${email},
          ${hash},
          ${business},
          ${"general"},
          NOW(),
          ${"approved"},
          NOW(),
          ${email}
        )
      `
      created += 1
      continue
    }

    const row = existing[0]
    let nextPassword = String(row.password)
    if (!isPasswordHash(nextPassword)) {
      nextPassword = await bcrypt.hash(nextPassword, 12)
    }

    await sql`
      UPDATE users
      SET
        approval_status = ${"approved"},
        approved_at = COALESCE(approved_at, NOW()),
        approved_by = COALESCE(approved_by, ${email}),
        password = ${nextPassword}
      WHERE id = ${row.id}
    `
    updated += 1
  }

  console.log(`Admin seeding complete. created=${created} updated=${updated}`)
}

main().catch((error) => {
  console.error("Admin seed failed:", error)
  process.exit(1)
})
