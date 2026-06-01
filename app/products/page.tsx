"use client"

import { ProductsInventory } from "@/components/products/products-inventory"

/** Seller-facing stock view: read-only inventory (sales still update quantities). */
export default function ProductsPage() {
  return <ProductsInventory readOnly />
}
