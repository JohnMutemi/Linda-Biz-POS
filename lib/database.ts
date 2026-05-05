import { neon } from "@neondatabase/serverless"

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
      registration_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

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
