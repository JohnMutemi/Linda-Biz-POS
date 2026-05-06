import { neon } from "@neondatabase/serverless"
import { getAdminEmails } from "@/lib/admin"
import { hashPassword, isPasswordHash } from "@/lib/auth"

let initialized = false

function getSql() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set")
  }
  return neon(databaseUrl)
}

export async function initDatabase() {
  if (initialized) return

  const sql = getSql()

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      business_name TEXT NOT NULL,
      location TEXT,
      user_type TEXT NOT NULL DEFAULT 'general',
      registration_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      approval_status TEXT NOT NULL DEFAULT 'pending',
      approved_at TIMESTAMPTZ,
      approved_by TEXT,
      login_route_token TEXT,
      login_route_sent_at TIMESTAMPTZ
    )
  `

  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'pending'`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_by TEXT`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS login_route_token TEXT`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS login_route_sent_at TIMESTAMPTZ`

  const adminEmails = Array.from(getAdminEmails())
  const adminSeedPassword = process.env.ADMIN_DEFAULT_PASSWORD
  const adminSeedName = process.env.ADMIN_DEFAULT_NAME || "System Admin"
  const adminSeedBusiness = process.env.ADMIN_DEFAULT_BUSINESS || "LindaBiz Administration"

  for (const adminEmail of adminEmails) {
    const existing = await sql`
      SELECT id, password
      FROM users
      WHERE email = ${adminEmail}
      LIMIT 1
    `

    if (existing.length === 0) {
      if (!adminSeedPassword) {
        continue
      }

      const id = `admin_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      const passwordHash = await hashPassword(adminSeedPassword)
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
          ${adminSeedName},
          ${adminEmail},
          ${passwordHash},
          ${adminSeedBusiness},
          ${"general"},
          NOW(),
          ${"approved"},
          NOW(),
          ${adminEmail}
        )
      `
      continue
    }

    const currentPassword = existing[0].password as string
    let nextPassword = currentPassword
    if (adminSeedPassword && !isPasswordHash(currentPassword)) {
      nextPassword = await hashPassword(currentPassword)
    }

    await sql`
      UPDATE users
      SET
        approval_status = ${"approved"},
        approved_at = COALESCE(approved_at, NOW()),
        approved_by = COALESCE(approved_by, ${adminEmail}),
        password = ${nextPassword}
      WHERE id = ${existing[0].id}
    `
  }

  await sql`
    CREATE TABLE IF NOT EXISTS admin_audit_logs (
      id BIGSERIAL PRIMARY KEY,
      client_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      admin_email TEXT NOT NULL,
      action TEXT NOT NULL,
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS admin_audit_logs_client_id_idx ON admin_audit_logs(client_id, created_at DESC)`

  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price DOUBLE PRECISION NOT NULL,
      quantity INTEGER NOT NULL,
      unit TEXT NOT NULL,
      category TEXT NOT NULL,
      user_type TEXT NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS products_user_id_idx ON products(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS products_user_id_name_idx ON products(user_id, name)`

  await sql`
    CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      total DOUBLE PRECISION NOT NULL,
      item_count INTEGER NOT NULL DEFAULT 0,
      date TIMESTAMPTZ NOT NULL
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS sales_user_id_date_idx ON sales(user_id, date DESC)`

  await sql`
    CREATE TABLE IF NOT EXISTS sale_items (
      id BIGSERIAL PRIMARY KEY,
      sale_id TEXT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      unit_price DOUBLE PRECISION NOT NULL,
      quantity INTEGER NOT NULL,
      unit TEXT NOT NULL,
      category TEXT NOT NULL,
      subtotal DOUBLE PRECISION NOT NULL
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS sale_items_sale_id_idx ON sale_items(sale_id)`

  initialized = true
}

export async function db() {
  await initDatabase()
  return getSql()
}
