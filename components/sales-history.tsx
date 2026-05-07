"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Receipt, Calendar, Package } from "lucide-react"

type SaleItem = {
  productId?: string
  productName?: string
  quantity?: number
  cartQuantity?: number
}

interface Sale {
  id: string
  items?: SaleItem[]
  total: number
  date: string
  userId: string
  itemCount?: number
}

interface SalesHistoryProps {
  userId: string
  limit?: number
}

export function SalesHistory({ userId, limit = 5 }: SalesHistoryProps) {
  const [sales, setSales] = useState<Sale[]>([])

  useEffect(() => {
    const loadSales = async () => {
      const response = await fetch(`/api/sales?userId=${encodeURIComponent(userId)}`)
      if (!response.ok) return
      const allSales: Sale[] = await response.json()
      setSales(allSales.slice(0, limit))
    }

    void loadSales()

    // Listen for dashboard refresh events
    const handleRefresh = () => void loadSales()
    window.addEventListener("dashboard-refresh", handleRefresh)

    return () => window.removeEventListener("dashboard-refresh", handleRefresh)
  }, [userId, limit])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getItemCount = (sale: Sale) => {
    if (sale.itemCount) return sale.itemCount
    if (sale.items && Array.isArray(sale.items)) {
      return sale.items.reduce((total: number, item: any) => {
        return total + (item.quantity || item.cartQuantity || 1)
      }, 0)
    }
    return 0
  }

  const getItemsSummary = (sale: Sale) => {
    const items = Array.isArray(sale.items) ? sale.items : []
    const normalized = items
      .map((it) => ({
        name: it.productName ?? "Item",
        qty: it.quantity ?? it.cartQuantity ?? 1,
      }))
      .filter((it) => it.name)

    if (normalized.length === 0) return null

    const shown = normalized.slice(0, 3).map((it) => `${it.name} ×${it.qty}`)
    const remaining = normalized.length - shown.length
    return remaining > 0 ? `${shown.join(", ")} +${remaining} more` : shown.join(", ")
  }

  if (sales.length === 0) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-emerald-100">
        <CardHeader>
          <CardTitle className="flex items-center text-emerald-900">
            <Receipt className="h-5 w-5 mr-2" />
            Recent Sales
          </CardTitle>
          <CardDescription className="text-emerald-700">No sales recorded yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-emerald-600">
            <Receipt className="h-12 w-12 mx-auto mb-3 text-emerald-300" />
            <p>No sales history available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-emerald-100">
      <CardHeader>
        <CardTitle className="flex items-center text-emerald-900">
          <Receipt className="h-5 w-5 mr-2" />
          Recent Sales
        </CardTitle>
        <CardDescription className="text-emerald-700">Latest {sales.length} transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sales.map((sale) => (
            <div key={sale.id} className="p-3 border border-emerald-100 rounded-lg bg-white/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-900">{formatDate(sale.date)}</span>
                </div>
                <Badge variant="outline" className="border-emerald-200">
                  KSh {sale.total.toLocaleString()}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-emerald-700">{getItemCount(sale)} items sold</span>
                </div>
                <span className="text-xs text-emerald-600">ID: {sale.id.split("_")[1]}</span>
              </div>
              {getItemsSummary(sale) && (
                <div className="mt-2 break-words text-xs leading-relaxed text-emerald-700">
                  <span className="font-medium">Items:</span> {getItemsSummary(sale)}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
