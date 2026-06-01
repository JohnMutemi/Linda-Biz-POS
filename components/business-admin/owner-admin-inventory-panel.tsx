"use client"

import { ProductsInventory } from "@/components/products/products-inventory"
import { businessAdminTheme as ba } from "@/lib/business-admin-theme"
import { cn } from "@/lib/utils"

/**
 * Owner-admin inventory — dedicated shell (ocean palette).
 * Product logic stays in ProductsInventory; this page owns layout + scope only.
 */
export function OwnerAdminInventoryPanel() {
  return (
    <div
      data-owner-admin-inventory-surface
      className={cn(
        "owner-admin-inventory-surface rounded-2xl border border-sky-200/90 bg-white p-4 shadow-sm sm:p-6 lg:p-8",
        ba.card,
      )}
    >
      <div className="mb-5 flex flex-col gap-3 border-b border-sky-200/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className={cn("owner-admin-eyebrow text-xs font-semibold uppercase tracking-[0.16em]", ba.sectionEyebrow)}>
            Catalogue
          </p>
          <h3 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">Manage products</h3>
          <p className="max-w-xl text-sm text-slate-600">
            Add, edit, or remove stock. Sellers see these quantities read-only at checkout.
          </p>
        </div>
        <p className="text-xs text-slate-500 sm:text-right">
          Use <span className="font-medium text-slate-700">Add Product</span> below to update your catalogue.
        </p>
      </div>

      <ProductsInventory embedded theme="owner-admin" />
    </div>
  )
}
