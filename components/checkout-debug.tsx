"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Database } from "lucide-react"

interface DebugData {
  products: any[]
  sales: any[]
  lastSale?: any
}

export function CheckoutDebug({ userId }: { userId: string }) {
  const [debugData, setDebugData] = useState<DebugData>({ products: [], sales: [] })
  const [isVisible, setIsVisible] = useState(false)

  const loadDebugData = () => {
    const allProducts = JSON.parse(localStorage.getItem("lindabiz_products") || "[]")
    const allSales = JSON.parse(localStorage.getItem("lindabiz_sales") || "[]")

    const userProducts = allProducts.filter((p: any) => p.userId === userId)
    const userSales = allSales.filter((s: any) => s.userId === userId)
    const lastSale = userSales.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

    setDebugData({
      products: userProducts,
      sales: userSales,
      lastSale,
    })
  }

  useEffect(() => {
    loadDebugData()

    const handleRefresh = () => loadDebugData()
    window.addEventListener("dashboard-refresh", handleRefresh)

    return () => window.removeEventListener("dashboard-refresh", handleRefresh)
  }, [userId])

  if (!isVisible) {
    return (
      <Button variant="outline" size="sm" onClick={() => setIsVisible(true)} className="fixed bottom-4 right-4 z-50">
        <Database className="h-4 w-4 mr-2" />
        Debug
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 overflow-y-auto z-50 bg-white shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Checkout Debug</CardTitle>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={loadDebugData}>
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
              ×
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div>
          <Badge variant="outline">Products: {debugData.products.length}</Badge>
          <div className="mt-1 space-y-1">
            {debugData.products.slice(0, 3).map((p: any) => (
              <div key={p.id} className="text-xs">
                {p.name}: {p.quantity} {p.unit}s
              </div>
            ))}
          </div>
        </div>

        <div>
          <Badge variant="outline">Sales: {debugData.sales.length}</Badge>
          {debugData.lastSale && (
            <div className="mt-1">
              <div className="text-xs">Last Sale:</div>
              <div className="text-xs">Items: {debugData.lastSale.itemCount || "N/A"}</div>
              <div className="text-xs">Total: KSh {debugData.lastSale.total}</div>
              <div className="text-xs">Time: {new Date(debugData.lastSale.date).toLocaleTimeString()}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
