"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, Calendar, FileText, TrendingUp, DollarSign, Package } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

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

interface SalesReportsProps {
  userId: string
  businessName: string
}

export function SalesReports({ userId, businessName }: SalesReportsProps) {
  const [sales, setSales] = useState<Sale[]>([])
  const [filteredSales, setFilteredSales] = useState<Sale[]>([])
  const [filterType, setFilterType] = useState<"today" | "week" | "month" | "custom">("today")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const loadSales = useCallback(async () => {
    const response = await fetch(`/api/sales?userId=${encodeURIComponent(userId)}`)
    if (!response.ok) return
    const userSales: Sale[] = await response.json()
    setSales(userSales)
  }, [userId])

  useEffect(() => {
    void loadSales()
  }, [loadSales])

  const filterSales = useCallback(() => {
    const now = new Date()
    let filtered: Sale[] = []

    switch (filterType) {
      case "today":
        filtered = sales.filter((sale) => {
          const saleDate = new Date(sale.date)
          return saleDate.toDateString() === now.toDateString()
        })
        break
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        filtered = sales.filter((sale) => new Date(sale.date) >= weekAgo)
        break
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        filtered = sales.filter((sale) => new Date(sale.date) >= monthAgo)
        break
      case "custom":
        if (startDate && endDate) {
          const start = new Date(startDate)
          const end = new Date(endDate)
          end.setHours(23, 59, 59, 999) // Include the entire end date
          filtered = sales.filter((sale) => {
            const saleDate = new Date(sale.date)
            return saleDate >= start && saleDate <= end
          })
        } else {
          filtered = sales
        }
        break
      default:
        filtered = sales
    }

    setFilteredSales(filtered)
  }, [sales, filterType, startDate, endDate])

  useEffect(() => {
    filterSales()
  }, [filterSales])

  const calculateMetrics = () => {
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0)
    const totalTransactions = filteredSales.length
    const totalItems = filteredSales.reduce((sum, sale) => {
      if (sale.itemCount) return sum + sale.itemCount
      if (sale.items && Array.isArray(sale.items)) {
        return (
          sum +
          sale.items.reduce((itemSum: number, item: any) => {
            return itemSum + (item.quantity || item.cartQuantity || 1)
          }, 0)
        )
      }
      return sum
    }, 0)
    const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

    return { totalRevenue, totalTransactions, totalItems, averageTransaction }
  }

  const generatePDFReport = async () => {
    if (filterType === "custom" && (!startDate || !endDate)) {
      toast({
        title: "Select date range",
        description: "Choose both start and end date before downloading a custom report.",
        variant: "destructive",
      })
      return
    }
    setIsGenerating(true)

    try {
      const periodDescription = getPeriodText()
      const params = new URLSearchParams({
        userId,
        filterType,
        periodLabel: periodDescription,
      })
      if (filterType === "custom") {
        if (startDate) params.set("startDate", startDate)
        if (endDate) params.set("endDate", endDate)
      }

      const response = await fetch(`/api/sales/report/pdf?${params.toString()}`)
      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || "Failed to generate PDF")
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url

      const periodText = filterType === "custom" && startDate && endDate ? `${startDate}_to_${endDate}` : filterType
      link.download = `${businessName.replace(/\s+/g, "_")}_Sales_Report_${periodText}_${new Date().toISOString().split("T")[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Report Generated",
        description: "Sales report PDF has been downloaded successfully.",
      })
    } catch (error) {
      console.error("Error generating report:", error)
      toast({
        title: "Error",
        description: "Failed to generate sales report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const getPeriodText = () => {
    switch (filterType) {
      case "today":
        return `Today (${new Date().toLocaleDateString()})`
      case "week":
        return "Last 7 Days"
      case "month":
        return "Last 30 Days"
      case "custom":
        if (startDate && endDate) {
          return `${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
        }
        return "Custom Period"
      default:
        return "All Time"
    }
  }

  const metrics = calculateMetrics()

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

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-emerald-100">
      <CardHeader>
        <CardTitle className="flex items-center text-emerald-900">
          <FileText className="h-5 w-5 mr-2" />
          Sales Reports
        </CardTitle>
        <CardDescription className="text-emerald-700">Generate and download detailed sales reports</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filter Controls */}
        <div className="space-y-4">
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-xs text-emerald-800 sm:text-sm">
            Report period: <span className="font-semibold">{getPeriodText()}</span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="filter-type">Report Period</Label>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="min-h-11 h-12 touch-manipulation border-emerald-200 text-base focus:border-emerald-400">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="custom">Custom Date Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filterType === "custom" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="min-h-11 border-emerald-200 text-base focus:border-emerald-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="min-h-11 border-emerald-200 text-base focus:border-emerald-400"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Metrics Summary */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">Revenue</span>
            </div>
            <p className="text-base font-bold tabular-nums text-emerald-900 sm:text-lg">
              KSh {metrics.totalRevenue.toLocaleString()}
            </p>
          </div>

          <div className="rounded-lg border border-green-200 bg-green-50 p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Transactions</span>
            </div>
            <p className="text-base font-bold tabular-nums text-green-900 sm:text-lg">{metrics.totalTransactions}</p>
          </div>

          <div className="rounded-lg border border-teal-200 bg-teal-50 p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-teal-600" />
              <span className="text-sm font-medium text-teal-700">Items Sold</span>
            </div>
            <p className="text-base font-bold tabular-nums text-teal-900 sm:text-lg">{metrics.totalItems}</p>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Average Sale</span>
            </div>
            <p className="text-base font-bold tabular-nums text-blue-900 sm:text-lg">
              KSh {Math.round(metrics.averageTransaction).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Recent Transactions Preview */}
        <div className="space-y-3">
          <h4 className="font-medium text-emerald-900">Recent Transactions ({getPeriodText()})</h4>
          {filteredSales.length === 0 ? (
            <div className="text-center py-8 text-emerald-600">
              <FileText className="h-12 w-12 mx-auto mb-3 text-emerald-300" />
              <p>No sales found for the selected period</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredSales.slice(0, 10).map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-emerald-100"
                >
                  <div>
                    <p className="text-sm font-medium text-emerald-900">
                      {new Date(sale.date).toLocaleDateString()} at {new Date(sale.date).toLocaleTimeString()}
                    </p>
                    <p className="text-xs text-emerald-600">
                      {sale.itemCount || sale.items?.length || 0} items • ID:{" "}
                      {sale.id.split("_")[1] || sale.id.substring(0, 8)}
                    </p>
                    {getItemsSummary(sale) && <p className="text-xs text-emerald-700 mt-1">{getItemsSummary(sale)}</p>}
                  </div>
                  <Badge variant="outline" className="border-emerald-200">
                    KSh {sale.total.toLocaleString()}
                  </Badge>
                </div>
              ))}
              {filteredSales.length > 10 && (
                <p className="text-xs text-emerald-600 text-center">
                  Showing 10 of {filteredSales.length} transactions
                </p>
              )}
            </div>
          )}
        </div>

        {/* Download Button */}
        <div className="sticky bottom-0 -mx-2 rounded-xl border border-emerald-100 bg-white/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
          <Button
            onClick={generatePDFReport}
            disabled={isGenerating || filteredSales.length === 0}
            className="min-h-12 w-full touch-manipulation bg-emerald-600 text-sm hover:bg-emerald-700 sm:mx-auto sm:max-w-md sm:text-base"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                <span className="sm:hidden">Generating PDF...</span>
                <span className="hidden sm:inline">Generating Report...</span>
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                <span className="sm:hidden">Download PDF</span>
                <span className="hidden sm:inline">Download Report ({filteredSales.length} transactions)</span>
              </>
            )}
          </Button>
          <p className="mt-2 px-1 text-center text-xs text-emerald-700 sm:hidden">
            {filteredSales.length} transaction{filteredSales.length === 1 ? "" : "s"} in selected period
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
