/**
 * Shared rules for low / out-of-stock UI (matches products table & API).
 * Supports camelCase or snake_case and numeric strings from JSON/localStorage.
 */
export type StockLike = {
  quantity: number
  reorderLevel?: number | string | null
  reorder_level?: number | string | null
}

export function reorderThreshold(item: StockLike): number {
  const raw = item.reorderLevel ?? item.reorder_level
  if (raw === undefined || raw === null || raw === "") return 5
  const n = typeof raw === "number" ? raw : Number.parseInt(String(raw).trim(), 10)
  if (!Number.isFinite(n) || n < 0) return 5
  return Math.trunc(n)
}

export function isLowStock(item: StockLike): boolean {
  const q = Number(item.quantity)
  if (!Number.isFinite(q)) return false
  return q > 0 && q <= reorderThreshold(item)
}

export function isOutOfStock(item: StockLike): boolean {
  return Number(item.quantity) === 0
}
