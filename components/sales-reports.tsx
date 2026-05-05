"use client"

import { useState, useEffect } from "react"
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
  userType: "general" | "wines-spirits"
  businessName: string
}

export function SalesReports({ userId, userType, businessName }: SalesReportsProps) {
  const [sales, setSales] = useState<Sale[]>([])
  const [filteredSales, setFilteredSales] = useState<Sale[]>([])
  const [filterType, setFilterType] = useState<"today" | "week" | "month" | "custom">("today")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    void loadSales()
  }, [userId])

  useEffect(() => {
    filterSales()
  }, [sales, filterType, startDate, endDate])

  const loadSales = async () => {
    const response = await fetch(`/api/sales?userId=${encodeURIComponent(userId)}`)
    if (!response.ok) return
    const userSales: Sale[] = await response.json()
    setSales(userSales)
  }

  const filterSales = () => {
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
  }

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
    setIsGenerating(true)

    try {
      const metrics = calculateMetrics()
      const reportDate = new Date().toLocaleDateString()

      // Create PDF content
      const pdfContent = generatePDFContent(metrics, reportDate)

      // Create and download PDF
      const blob = new Blob([pdfContent], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url

      const periodText = filterType === "custom" && startDate && endDate ? `${startDate}_to_${endDate}` : filterType

      link.download = `${businessName.replace(/\s+/g, "_")}_Sales_Report_${periodText}_${new Date().toISOString().split("T")[0]}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Report Generated",
        description: "Sales report has been downloaded successfully. You can print it as PDF from your browser.",
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

  const generatePDFContent = (metrics: any, reportDate: string) => {
    const periodText = getPeriodText()

    const escapeHtml = (value: string) =>
      value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;")

    const getItemsSummary = (sale: Sale) => {
      const items = Array.isArray(sale.items) ? sale.items : []
      const normalized = items
        .map((it) => ({
          name: it.productName ?? "Item",
          qty: it.quantity ?? it.cartQuantity ?? 1,
        }))
        .filter((it) => it.name)

      if (normalized.length === 0) return "—"
      const shown = normalized.slice(0, 4).map((it) => `${escapeHtml(it.name)} ×${it.qty}`)
      const remaining = normalized.length - shown.length
      return remaining > 0 ? `${shown.join(", ")} +${remaining} more` : shown.join(", ")
    }

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Sales Report - ${businessName}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            color: #333;
            line-height: 1.6;
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #059669;
            padding-bottom: 20px;
        }
        .header h1 { 
            color: #059669; 
            margin: 0;
            font-size: 28px;
        }
        .header h2 { 
            color: #065f46; 
            margin: 5px 0;
            font-size: 18px;
            font-weight: normal;
        }
        .metrics { 
            display: grid; 
            grid-template-columns: repeat(2, 1fr); 
            gap: 20px; 
            margin-bottom: 30px;
        }
        .metric-card { 
            border: 1px solid #d1fae5; 
            padding: 20px; 
            border-radius: 8px;
            background-color: #f0fdf4;
        }
        .metric-card h3 { 
            margin: 0 0 10px 0; 
            color: #059669;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .metric-card .value { 
            font-size: 24px; 
            font-weight: bold; 
            color: #065f46;
        }
        .sales-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
        }
        .sales-table th, .sales-table td { 
            border: 1px solid #d1fae5; 
            padding: 12px; 
            text-align: left;
        }
        .sales-table th { 
            background-color: #059669; 
            color: white;
            font-weight: bold;
        }
        .sales-table tr:nth-child(even) { 
            background-color: #f0fdf4;
        }
        .sales-table tr:hover { 
            background-color: #ecfdf5;
        }
        .footer { 
            margin-top: 30px; 
            text-align: center; 
            color: #6b7280;
            border-top: 1px solid #d1fae5;
            padding-top: 20px;
        }
        .summary { 
            background-color: #ecfdf5; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 20px;
            border-left: 4px solid #059669;
        }
        @media print {
            body { margin: 0; }
            .header { page-break-after: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${businessName}</h1>
        <h2>Sales Report - ${periodText}</h2>
        <p>Generated on ${reportDate}</p>
    </div>

    <div class="summary">
        <h3 style="margin-top: 0; color: #059669;">Report Summary</h3>
        <p><strong>Period:</strong> ${periodText}</p>
        <p><strong>Total Transactions:</strong> ${metrics.totalTransactions}</p>
        <p><strong>Business Type:</strong> ${userType === "general" ? "General Shop" : "Wines & Spirits"}</p>
    </div>

    <div class="metrics">
        <div class="metric-card">
            <h3>Total Revenue</h3>
            <div class="value">KSh ${metrics.totalRevenue.toLocaleString()}</div>
        </div>
        <div class="metric-card">
            <h3>Total Transactions</h3>
            <div class="value">${metrics.totalTransactions}</div>
        </div>
        <div class="metric-card">
            <h3>Items Sold</h3>
            <div class="value">${metrics.totalItems}</div>
        </div>
        <div class="metric-card">
            <h3>Average Transaction</h3>
            <div class="value">KSh ${Math.round(metrics.averageTransaction).toLocaleString()}</div>
        </div>
    </div>

    <h3 style="color: #059669; margin-bottom: 15px;">Transaction Details</h3>
    <table class="sales-table">
        <thead>
            <tr>
                <th>Date & Time</th>
                <th>Transaction ID</th>
                <th>Items Sold</th>
                <th>Amount (KSh)</th>
            </tr>
        </thead>
        <tbody>
            ${filteredSales
              .map(
                (sale) => `
                <tr>
                    <td>${new Date(sale.date).toLocaleString()}</td>
                    <td>${sale.id.split("_")[1] || sale.id.substring(0, 8)}</td>
                    <td>${getItemsSummary(sale)}</td>
                    <td>${sale.total.toLocaleString()}</td>
                </tr>
            `,
              )
              .join("")}
        </tbody>
    </table>

    <div class="footer">
        <p>This report was generated by LindaBiz POS System</p>
        <p>For support, contact: support@lindabiz.com</p>
    </div>
</body>
</html>`
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filter-type">Report Period</Label>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="border-emerald-200 focus:border-emerald-400">
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
                    className="border-emerald-200 focus:border-emerald-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border-emerald-200 focus:border-emerald-400"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Metrics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">Revenue</span>
            </div>
            <p className="text-lg font-bold text-emerald-900">KSh {metrics.totalRevenue.toLocaleString()}</p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Transactions</span>
            </div>
            <p className="text-lg font-bold text-green-900">{metrics.totalTransactions}</p>
          </div>

          <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-teal-600" />
              <span className="text-sm font-medium text-teal-700">Items Sold</span>
            </div>
            <p className="text-lg font-bold text-teal-900">{metrics.totalItems}</p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Average Sale</span>
            </div>
            <p className="text-lg font-bold text-blue-900">
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
        <div className="flex justify-center pt-4">
          <Button
            onClick={generatePDFReport}
            disabled={isGenerating || filteredSales.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating Report...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download Report ({filteredSales.length} transactions)
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
