"use client"

import type React from "react"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Package, ShoppingBag, Search, Sparkles } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { BackToDashboardButton } from "@/components/dashboard/back-to-dashboard-button"
import { DashboardPageShell } from "@/components/dashboard/page-shell"
import { isLowStock, isOutOfStock, reorderThreshold } from "@/lib/inventory-stock"
import { getInventoryTheme } from "@/lib/business-admin-theme"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  name: string
  price: number
  quantity: number
  unit: string
  category: string
  description?: string
  reorderLevel?: number
  userType: "general" | "wines-spirits"
  userId: string
}

interface PopularItem {
  name: string
  category: string
  suggestedPrice: number
  unit: string
}

export type ProductsInventoryProps = {
  /** When true, sellers can only view stock levels (no add/edit/delete). */
  readOnly?: boolean
  /** Renders without full-page chrome when embedded in business-admin Inventory tab. */
  embedded?: boolean
  /** Compact card list for narrow dashboard columns. */
  embeddedColumn?: boolean
  /** Ocean blue & teal styling when embedded in the owner admin panel. */
  theme?: "default" | "owner-admin"
}

export function ProductsInventory({
  readOnly = false,
  embedded = false,
  embeddedColumn = false,
  theme = "default",
}: ProductsInventoryProps) {
  const ui = getInventoryTheme(theme)
  const PAGE_SIZE = 5
  const [products, setProducts] = useState<Product[]>([])
  const [user, setUser] = useState<any>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showPopularItems, setShowPopularItems] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
    unit: "",
    category: "",
    description: "",
    reorderLevel: "5",
  })

  const router = useRouter()
  const { toast } = useToast()

  // Popular items for general shops
  const popularGeneralItems: PopularItem[] = [
    // Food & Snacks
    { name: "Bread (Loaf)", category: "Food", suggestedPrice: 60, unit: "piece" },
    { name: "Milk (500ml)", category: "Dairy", suggestedPrice: 60, unit: "packet" },
    { name: "Eggs", category: "Food", suggestedPrice: 15, unit: "piece" },
    { name: "Rice (2kg)", category: "Food", suggestedPrice: 200, unit: "packet" },
    { name: "Sugar (2kg)", category: "Food", suggestedPrice: 250, unit: "packet" },
    { name: "Cooking Oil (500ml)", category: "Food", suggestedPrice: 180, unit: "bottle" },
    { name: "Maize Flour (2kg)", category: "Food", suggestedPrice: 120, unit: "packet" },
    { name: "Tea Leaves (250g)", category: "Beverages", suggestedPrice: 80, unit: "packet" },
    { name: "Coffee (100g)", category: "Beverages", suggestedPrice: 150, unit: "packet" },
    { name: "Salt (500g)", category: "Food", suggestedPrice: 25, unit: "packet" },

    // Beverages
    { name: "Soda (500ml)", category: "Beverages", suggestedPrice: 80, unit: "bottle" },
    { name: "Water (500ml)", category: "Beverages", suggestedPrice: 25, unit: "bottle" },
    { name: "Juice (500ml)", category: "Beverages", suggestedPrice: 120, unit: "packet" },
    { name: "Energy Drink", category: "Beverages", suggestedPrice: 150, unit: "bottle" },

    // Household Items
    { name: "Soap Bar", category: "Household", suggestedPrice: 40, unit: "piece" },
    { name: "Detergent (500g)", category: "Household", suggestedPrice: 80, unit: "packet" },
    { name: "Toilet Paper", category: "Household", suggestedPrice: 60, unit: "roll" },
    { name: "Matchbox", category: "Household", suggestedPrice: 5, unit: "box" },
    { name: "Candles", category: "Household", suggestedPrice: 20, unit: "piece" },
    { name: "Batteries (AA)", category: "Household", suggestedPrice: 50, unit: "pair" },

    // Personal Care
    { name: "Toothpaste", category: "Personal Care", suggestedPrice: 120, unit: "tube" },
    { name: "Toothbrush", category: "Personal Care", suggestedPrice: 80, unit: "piece" },
    { name: "Shampoo (200ml)", category: "Personal Care", suggestedPrice: 150, unit: "bottle" },
    { name: "Body Lotion", category: "Personal Care", suggestedPrice: 200, unit: "bottle" },
    { name: "Vaseline", category: "Personal Care", suggestedPrice: 100, unit: "jar" },

    // Snacks
    { name: "Biscuits", category: "Snacks", suggestedPrice: 30, unit: "packet" },
    { name: "Sweets", category: "Snacks", suggestedPrice: 5, unit: "piece" },
    { name: "Peanuts (100g)", category: "Snacks", suggestedPrice: 50, unit: "packet" },
    { name: "Crisps", category: "Snacks", suggestedPrice: 40, unit: "packet" },

    // Stationery
    { name: "Pen", category: "Stationery", suggestedPrice: 20, unit: "piece" },
    { name: "Pencil", category: "Stationery", suggestedPrice: 10, unit: "piece" },
    { name: "Exercise Book", category: "Stationery", suggestedPrice: 40, unit: "piece" },
    { name: "Ruler", category: "Stationery", suggestedPrice: 30, unit: "piece" },

    // Electronics
    { name: "Phone Charger", category: "Electronics", suggestedPrice: 350, unit: "piece" },
    { name: "Earphones", category: "Electronics", suggestedPrice: 250, unit: "piece" },
    { name: "USB Cable", category: "Electronics", suggestedPrice: 150, unit: "piece" },
    { name: "Extension Cable", category: "Electronics", suggestedPrice: 450, unit: "piece" },
  ]

  // Popular brands for wines, spirits, and beers
  const popularWineSpiritsItems: PopularItem[] = [
    // Beers
    { name: "Guinness", category: "Beer", suggestedPrice: 300, unit: "bottle" },
    { name: "Tusker", category: "Beer", suggestedPrice: 250, unit: "bottle" },
    { name: "Tusker Lite", category: "Beer", suggestedPrice: 250, unit: "bottle" },
    { name: "Allsopps", category: "Beer", suggestedPrice: 280, unit: "bottle" },
    { name: "White Cap", category: "Beer", suggestedPrice: 250, unit: "bottle" },
    { name: "Pilsner", category: "Beer", suggestedPrice: 250, unit: "bottle" },
    { name: "Senator Keg", category: "Beer", suggestedPrice: 120, unit: "bottle" },
    { name: "Balozi", category: "Beer", suggestedPrice: 150, unit: "bottle" },
    { name: "Club Pilsner", category: "Beer", suggestedPrice: 280, unit: "bottle" },
    { name: "Heineken", category: "Beer", suggestedPrice: 350, unit: "bottle" },

    // Spirits
    { name: "Kenya Cane", category: "Spirits", suggestedPrice: 800, unit: "bottle" },
    { name: "Chrome Gin", category: "Spirits", suggestedPrice: 1200, unit: "bottle" },
    { name: "Gilbeys Gin", category: "Spirits", suggestedPrice: 1500, unit: "bottle" },
    { name: "Smirnoff Vodka", category: "Spirits", suggestedPrice: 2000, unit: "bottle" },
    { name: "Johnnie Walker Red", category: "Spirits", suggestedPrice: 2500, unit: "bottle" },
    { name: "Johnnie Walker Black", category: "Spirits", suggestedPrice: 4500, unit: "bottle" },
    { name: "Jack Daniels", category: "Spirits", suggestedPrice: 4000, unit: "bottle" },
    { name: "Jameson", category: "Spirits", suggestedPrice: 3500, unit: "bottle" },
    { name: "Hennessy VS", category: "Spirits", suggestedPrice: 6000, unit: "bottle" },
    { name: "Absolut Vodka", category: "Spirits", suggestedPrice: 2800, unit: "bottle" },

    // Wines
    { name: "Drostdy-Hof", category: "Wine", suggestedPrice: 1200, unit: "bottle" },
    { name: "4th Street Wine", category: "Wine", suggestedPrice: 800, unit: "bottle" },
    { name: "Cellar Cask", category: "Wine", suggestedPrice: 600, unit: "bottle" },
    { name: "Nederburg", category: "Wine", suggestedPrice: 1500, unit: "bottle" },
    { name: "KWV", category: "Wine", suggestedPrice: 1000, unit: "bottle" },
    { name: "Durbanville Hills", category: "Wine", suggestedPrice: 1800, unit: "bottle" },
    { name: "Boschendal", category: "Wine", suggestedPrice: 2000, unit: "bottle" },
    { name: "Amarula Cream", category: "Wine", suggestedPrice: 2500, unit: "bottle" },
    { name: "Viceroy", category: "Wine", suggestedPrice: 500, unit: "bottle" },
    { name: "Chamdor", category: "Wine", suggestedPrice: 400, unit: "bottle" },
  ]

  const popularQuickAddItems: PopularItem[] = [...popularGeneralItems, ...popularWineSpiritsItems]

  const loadProducts = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/products?userId=${encodeURIComponent(userId)}`)
      if (!response.ok) {
        throw new Error("Failed to load products")
      }
      const data: Product[] = await response.json()
      setProducts(data)
    } catch {
      toast({
        title: "Load failed",
        description: "Could not load products. Please refresh and try again.",
        variant: "destructive",
      })
    }
  }, [toast])

  useEffect(() => {
    let cancelled = false

    async function resolveUser() {
      const userData = localStorage.getItem("lindabiz_user")
      if (userData) {
        const parsedUser = JSON.parse(userData)
        if (!cancelled) {
          setUser(parsedUser)
          void loadProducts(parsedUser.id)
        }
        return
      }

      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" })
        if (!response.ok || cancelled) return
        const session = await response.json()
        if (!session?.id || cancelled) return
        const sessionUser = {
          id: session.id,
          name: session.name,
          email: session.email,
          businessName: session.businessName,
          userType: session.userType,
        }
        setUser(sessionUser)
        void loadProducts(session.id)
      } catch {
        // session unavailable
      }
    }

    void resolveUser()
    return () => {
      cancelled = true
    }
  }, [loadProducts])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    const price = Number.parseFloat(formData.price)
    const quantity = Number.parseInt(formData.quantity)
    if (!Number.isFinite(price) || price < 0) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid price.",
        variant: "destructive",
      })
      return
    }
    if (!Number.isFinite(quantity) || quantity < 0) {
      toast({
        title: "Invalid quantity",
        description: "Please enter a valid quantity.",
        variant: "destructive",
      })
      return
    }
    if (!formData.category) {
      toast({
        title: "Category required",
        description: "Please select a category.",
        variant: "destructive",
      })
      return
    }

    const newProduct: Product = {
      id:
        editingProduct?.id ??
        (globalThis.crypto?.randomUUID?.() ?? `prod_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`),
      name: formData.name,
      price,
      quantity,
      unit: formData.unit,
      category: formData.category,
      description: formData.description,
      reorderLevel: Number.parseInt(formData.reorderLevel || "5"),
      userType: user.userType,
      userId: user.id,
    }

    try {
      if (editingProduct) {
        const response = await fetch("/api/products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newProduct),
        })
        if (!response.ok) {
          const data = await response.json().catch(() => null)
          throw new Error(data?.error || "Failed to update product")
        }
        await loadProducts(user.id)
        localStorage.setItem("lindabiz_last_inventory_update", Date.now().toString())
        window.dispatchEvent(new Event("inventory-refresh"))
        toast({
          title: "Product updated",
          description: `${newProduct.name} has been updated successfully.`,
        })
      } else {
        const response = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newProduct),
        })
        const data = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(data?.error || "Failed to add product")
        }
        await loadProducts(user.id)
        localStorage.setItem("lindabiz_last_inventory_update", Date.now().toString())
        window.dispatchEvent(new Event("inventory-refresh"))
        if (data?.merged) {
          toast({
            title: "Stock updated",
            description: `${newProduct.name} already existed — added ${quantity} units to your existing line.`,
          })
        } else {
          toast({
            title: "Product added",
            description: `${newProduct.name} has been added to your inventory.`,
          })
        }
      }

      // Reset form
      setFormData({
        name: "",
        price: "",
        quantity: "",
        unit: "",
        category: "",
        description: "",
        reorderLevel: "5",
      })
      setIsAddDialogOpen(false)
      setEditingProduct(null)
      setShowPopularItems(false)
    } catch {
      toast({
        title: "Save failed",
        description: "Could not save product. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      unit: product.unit,
      category: product.category,
      description: product.description ?? "",
      reorderLevel: (product.reorderLevel ?? 5).toString(),
    })
    setIsAddDialogOpen(true)
    setShowPopularItems(false)
  }

  const handleDelete = async (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      if (!user) return
      try {
        const response = await fetch(`/api/products?id=${encodeURIComponent(productId)}&userId=${encodeURIComponent(user.id)}`, {
          method: "DELETE",
        })
        if (!response.ok) {
          const data = await response.json().catch(() => null)
          throw new Error(data?.error || "Failed to delete product")
        }
        await loadProducts(user.id)
        localStorage.setItem("lindabiz_last_inventory_update", Date.now().toString())
        window.dispatchEvent(new Event("inventory-refresh"))
        toast({
          title: "Product deleted",
          description: "Product has been removed from your inventory.",
        })
      } catch {
        toast({
          title: "Delete failed",
          description: "Could not delete product. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleItemSelect = (item: PopularItem) => {
    setFormData((prev) => ({
      name: item.name,
      price: item.suggestedPrice.toString(),
      quantity: "10", // Default quantity
      unit: item.unit,
      category: item.category,
      description: "",
      reorderLevel: prev.reorderLevel || "5",
    }))
    setShowPopularItems(false)
    toast({
      title: "Item selected",
      description: `${item.name} details filled. You can adjust the price and quantity.`,
    })
  }

  const getDefaultCategories = () => {
    return [
      "Food",
      "Dairy",
      "Beverages",
      "Beer",
      "Wine",
      "Spirits",
      "Electronics",
      "Household",
      "Personal Care",
      "Snacks",
      "Stationery",
      "Other",
    ]
  }

  const getDefaultUnits = () => {
    return ["piece", "kg", "gram", "liter", "packet", "box", "bottle", "case", "tube", "roll", "jar", "pair"]
  }

  const filteredItems = popularQuickAddItems.filter(
    (item) => formData.category === "" || item.category === formData.category,
  )
  const filteredProducts = products.filter((product) => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return true
    return (
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.unit.toLowerCase().includes(query)
    )
  })
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE))
  const paginatedProducts = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages)
    const start = (safePage - 1) * PAGE_SIZE
    return filteredProducts.slice(start, start + PAGE_SIZE)
  }, [currentPage, filteredProducts, totalPages])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const loadingBlock = (
    <div className={embedded ? ui.pageLoadingEmbedded : ui.pageLoading}>
      <div className="text-center">
        <div className={cn("animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4", ui.spinner)} />
        <p className={ui.text}>Loading...</p>
      </div>
    </div>
  )

  if (!user) {
    return loadingBlock
  }

  const inventoryBody = (
    <>
        <div className={cn("space-y-6", embeddedColumn && "space-y-3")}>
          {embedded && !readOnly ? (
            <div className={cn("flex", embeddedColumn ? "w-full" : "justify-end")}>
              <Button
                onClick={() => {
                  setEditingProduct(null)
                  setFormData({
                    name: "",
                    price: "",
                    quantity: "",
                    unit: "",
                    category: "",
                    description: "",
                    reorderLevel: "5",
                  })
                  setShowPopularItems(false)
                  setIsAddDialogOpen(true)
                }}
                className={cn(ui.btn, embeddedColumn && "w-full")}
                size={embeddedColumn ? "sm" : "default"}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
          ) : null}
          {!embedded ? (
          <div className="dashboard-sticky-header flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div className="flex-1">
              <h1 className={cn("text-2xl font-bold", ui.textStrong)}>
                {readOnly ? "Stock on hand" : "Inventory management"}
              </h1>
              <p className={ui.text}>
                {readOnly
                  ? "View what is in stock. Product changes are managed by your business owner."
                  : "Add, edit, update, or remove products for this business."}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <BackToDashboardButton className="order-2 sm:order-1" label="Dashboard" />
              {!readOnly ? (
                <Button
                  onClick={() => {
                    setEditingProduct(null)
                    setFormData({
                      name: "",
                      price: "",
                      quantity: "",
                      unit: "",
                      category: "",
                      description: "",
                      reorderLevel: "5",
                    })
                    setShowPopularItems(false)
                    setIsAddDialogOpen(true)
                  }}
                  className={cn(ui.btn, "order-1 sm:order-2", embeddedColumn && "w-full sm:w-auto")}
                  size={embeddedColumn ? "sm" : "default"}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              ) : null}
            </div>
          </div>
          ) : null}
          <Card className={ui.card}>
            <CardContent className={embeddedColumn ? "p-2" : "p-4"}>
              <div className="flex flex-col gap-2">
                <div className="relative flex-1">
                  <Search
                    className={cn(
                      "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2",
                      ui.textSearchIcon,
                    )}
                  />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products..."
                    className={cn(ui.input, embeddedColumn ? "h-9" : "h-11")}
                  />
                </div>
                <Badge variant="outline" className={ui.badge}>
                  {filteredProducts.length} items • p.{currentPage}/{totalPages}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {products.length === 0 ? (
            <Card className={ui.cardMuted}>
              <CardContent className="flex flex-col items-center justify-center py-12 px-4">
                <div className={ui.emptyIconWrap}>
                  <Package className={cn("h-12 w-12", ui.emptyIcon)} />
                </div>
                <h3 className={cn("text-lg font-semibold mb-2 text-center", ui.textStrong)}>No products yet</h3>
                <p className={cn(ui.text, "text-center mb-6 max-w-md")}>
                  {readOnly
                    ? "No products in inventory yet. Your business owner will add stock here."
                    : "Start by adding your first product to begin managing your inventory and tracking sales."}
                </p>
                {!readOnly ? (
                  <Button
                    onClick={() => {
                      setEditingProduct(null)
                      setFormData({
                        name: "",
                        price: "",
                        quantity: "",
                        unit: "",
                        category: "",
                        description: "",
                        reorderLevel: "5",
                      })
                      setShowPopularItems(false)
                      setIsAddDialogOpen(true)
                    }}
                    className={ui.btn}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Product
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {!embeddedColumn ? (
                <div className={ui.panel}>
                  <p className={ui.panelTitle}>
                    <Sparkles className={ui.panelIcon} />
                    All products
                  </p>
                  <p className={ui.panelDesc}>
                    Same rows and columns on desktop and phone. On smaller screens, swipe horizontally to see all columns.
                  </p>
                </div>
              ) : null}

              {embeddedColumn ? (
                <div className="space-y-2">
                  {paginatedProducts.map((product) => {
                    const rl = reorderThreshold(product)
                    const status = isOutOfStock(product) ? "out" : isLowStock(product) ? "low" : "ok"
                    return (
                      <div
                        key={product.id}
                        className={ui.listCard}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className={cn("font-semibold leading-snug", ui.textTitle)}>{product.name}</p>
                            <p className={cn("mt-0.5 text-xs", ui.textMuted)}>
                              {product.category} • {product.unit}
                            </p>
                          </div>
                          <Badge
                            variant={status === "out" ? "destructive" : "outline"}
                            className={
                              status === "low"
                                ? "shrink-0 bg-amber-100 text-amber-900 border-amber-300"
                                : status === "ok"
                                  ? ui.badgeOk
                                  : "shrink-0"
                            }
                          >
                            {status === "out" ? "Out" : status === "low" ? "Low" : "OK"}
                          </Badge>
                        </div>
                        <p className={cn("mt-2 text-sm tabular-nums", ui.textBody)}>
                          Qty <span className={cn("font-semibold", ui.textTitle)}>{product.quantity}</span>
                          <span className={ui.textMuted}> • </span>
                          KSh {product.price.toLocaleString()}
                          <span className={ui.textMuted}> • </span>
                          Reorder {rl}
                        </p>
                        {!readOnly ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(product)}
                              className={cn("h-8", ui.btnOutline)}
                            >
                              <Edit className="mr-1 h-3.5 w-3.5" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(product.id)}
                              className="h-8 border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="mr-1 h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              ) : null}

              {!embeddedColumn ? (
              <Card className={ui.cardTable}>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className={cn("w-full text-left text-sm", readOnly ? "min-w-[820px]" : "min-w-[980px]")}>
                      <thead className={ui.tableHead}>
                        <tr>
                          <th className={cn("px-4 py-3", ui.tableHeadCell)}>Product</th>
                          <th className={cn("px-4 py-3", ui.tableHeadCell)}>Category</th>
                          <th className={cn("px-4 py-3 whitespace-nowrap", ui.tableHeadCell)}>Quantity</th>
                          <th className={cn("px-4 py-3 whitespace-nowrap", ui.tableHeadCell)}>Price</th>
                          <th className={cn("px-4 py-3 whitespace-nowrap", ui.tableHeadCell)}>Reorder</th>
                          <th className={cn("px-4 py-3", ui.tableHeadCell)}>Status</th>
                          <th className={cn("px-4 py-3 min-w-[160px]", ui.tableHeadCell)}>Description</th>
                          {!readOnly ? (
                            <th className={cn("px-4 py-3 text-right whitespace-nowrap", ui.tableHeadCell)}>Actions</th>
                          ) : null}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedProducts.map((product, rowIdx) => {
                          const rl = reorderThreshold(product)
                          const status =
                            isOutOfStock(product) ? "out" : isLowStock(product) ? "low" : "ok"
                          return (
                            <tr
                              key={product.id}
                              className={rowIdx % 2 === 0 ? ui.tableRowEven : ui.tableRowAlt}
                            >
                              <td className={cn("align-top", embeddedColumn ? "px-2 py-2" : "px-4 py-3")}>
                                <p className={cn("font-semibold", ui.textTitle, embeddedColumn && "text-sm")}>
                                  {product.name}
                                </p>
                                <p className={cn("text-xs mt-0.5", ui.textMuted)}>
                                  {embeddedColumn ? product.category : `Unit: ${product.unit}`}
                                </p>
                              </td>
                              {!embeddedColumn ? (
                                <td className={cn("px-4 py-3 align-top", ui.textBody)}>{product.category}</td>
                              ) : null}
                              <td
                                className={cn(
                                  "align-top whitespace-nowrap tabular-nums font-medium",
                                  ui.textTitle,
                                  embeddedColumn ? "px-2 py-2 text-sm" : "px-4 py-3",
                                )}
                              >
                                {product.quantity}{" "}
                                {!embeddedColumn ? (
                                  <span className={cn("font-normal", ui.textMuted)}>
                                    {product.unit}
                                    {product.quantity === 1 ? "" : "s"}
                                  </span>
                                ) : null}
                              </td>
                              <td
                                className={cn(
                                  "align-top whitespace-nowrap tabular-nums",
                                  ui.textStrong,
                                  embeddedColumn ? "px-2 py-2 text-sm" : "px-4 py-3",
                                )}
                              >
                                KSh {product.price.toLocaleString()}
                              </td>
                              {!embeddedColumn ? (
                                <td className={cn("px-4 py-3 align-top whitespace-nowrap tabular-nums", ui.text)}>{rl}</td>
                              ) : null}
                              <td className={cn("align-top", embeddedColumn ? "px-2 py-2" : "px-4 py-3")}>
                                <Badge
                                  variant={status === "out" ? "destructive" : "outline"}
                                  className={
                                    status === "low"
                                      ? "bg-amber-100 text-amber-900 border-amber-300"
                                      : status === "ok"
                                        ? ui.badgeOk
                                        : ""
                                  }
                                >
                                  {status === "out" ? "Out of stock" : status === "low" ? "Low stock" : "In stock"}
                                </Badge>
                              </td>
                              {!embeddedColumn ? (
                                <td className="px-4 py-3 align-top max-w-[220px]">
                                  <p className={cn("line-clamp-2", ui.textBody)}>
                                    {product.description?.trim() ? product.description : "—"}
                                  </p>
                                </td>
                              ) : null}
                              {!readOnly ? (
                                <td className={cn("align-top", embeddedColumn ? "px-2 py-2" : "px-4 py-3")}>
                                  <div className={cn("flex justify-end", embeddedColumn ? "flex-col gap-1" : "gap-2")}>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEdit(product)}
                                      className={cn(
                                        ui.btnOutline,
                                        embeddedColumn ? "h-8 w-full px-2" : "min-h-10",
                                      )}
                                    >
                                      <Edit className={cn("h-4 w-4", !embeddedColumn && "mr-1")} />
                                      {!embeddedColumn ? "Edit" : null}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDelete(product.id)}
                                      className={cn(
                                        "border-red-200 hover:bg-red-50 text-red-600",
                                        embeddedColumn ? "h-8 w-full px-2" : "min-h-10",
                                      )}
                                    >
                                      <Trash2 className={cn("h-4 w-4", !embeddedColumn && "mr-1")} />
                                      {!embeddedColumn ? "Delete" : null}
                                    </Button>
                                  </div>
                                </td>
                              ) : null}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              ) : null}
              {filteredProducts.length > PAGE_SIZE && (
                <div className={cn("flex flex-wrap items-center justify-between gap-3", ui.paginationBar)}>
                  <p className={cn("text-sm", ui.text)}>
                    Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filteredProducts.length)} of{" "}
                    {filteredProducts.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className={ui.btnOutlineSm}
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: totalPages }, (_, index) => {
                      const page = index + 1
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          className={currentPage === page ? ui.btnPaginationActive : ui.btnOutlineSm}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      )
                    })}
                    <Button
                      variant="outline"
                      className={ui.btnOutlineSm}
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
              {filteredProducts.length === 0 && (
                <Card className={ui.card}>
                  <CardContent className={cn("py-10 text-center", ui.text)}>
                    <Search className={cn("mx-auto mb-3 h-8 w-8", ui.textSearchEmpty)} />
                    No products match your search.
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

      <Dialog open={isAddDialogOpen && !readOnly} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className={ui.dialog}>
          <DialogHeader>
            <DialogTitle className={ui.dialogTitle}>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription className={ui.dialogDesc}>
              {editingProduct ? "Update product information" : "Add a new product to your inventory"}
            </DialogDescription>
          </DialogHeader>

          {/* Popular Items Section */}
          {!editingProduct && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={cn("text-lg font-medium", ui.textStrong)}>Quick Add Popular Items</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPopularItems(!showPopularItems)}
                  className={ui.btnOutlineSm}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  {showPopularItems ? "Hide" : "Show"} Items
                </Button>
              </div>

              {showPopularItems && (
                <Card className={ui.popularCard}>
                  <CardHeader className="pb-3">
                    <CardTitle className={ui.popularCardTitle}>Starter catalogue shortcuts</CardTitle>
                    <CardDescription className={ui.popularCardDesc}>
                      Click to auto-fill the form. Saving will add to an existing line when the product name matches (same
                      item, trimmed) — quantity is increased instead of creating a duplicate.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {filteredItems.map((item, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleItemSelect(item)}
                          className={ui.popularItemBtn}
                        >
                          <div className="flex flex-col items-start">
                            <span className={ui.popularItemName}>{item.name}</span>
                            <span className={ui.popularItemMeta}>
                              {item.category} • KSh {item.suggestedPrice}
                            </span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter product name"
                required
                className={ui.inputField}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (KSh)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  required
                  className={ui.inputField}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="0"
                  required
                  className={ui.inputField}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, unit: value }))}
                >
                  <SelectTrigger className={ui.inputField}>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {getDefaultUnits().map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, category: value }))
                    // Show relevant items when category changes
                    if (!editingProduct) {
                      setShowPopularItems(true)
                    }
                  }}
                >
                  <SelectTrigger className={ui.inputField}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {getDefaultCategories().map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Summary + key specs (e.g., brand, size, notes)"
                className={ui.inputField}
              />
              <p className={ui.hint}>
                Tip: separate details with commas, or new lines for easy reading.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reorderLevel">Reorder level</Label>
              <Input
                id="reorderLevel"
                name="reorderLevel"
                type="number"
                value={formData.reorderLevel}
                onChange={handleInputChange}
                placeholder="5"
                min={0}
                className={ui.inputField}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className={ui.btnOutlineSm}
              >
                Cancel
              </Button>
              <Button type="submit" className={ui.btn}>
                {editingProduct ? "Update Product" : "Add Product"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )

  if (embedded) {
    return <div className="space-y-6">{inventoryBody}</div>
  }

  return (
    <div className="min-h-screen relative">
      <div className={cn("absolute inset-0 -z-10", ui.pageBg)} />
      <div className="absolute inset-0 opacity-20 -z-10 pointer-events-none overflow-hidden">
        <div
          className={cn(
            "absolute top-20 right-20 w-64 h-64 rounded-full mix-blend-multiply filter blur-xl animate-pulse",
            ui.blobPrimary,
          )}
        />
        <div
          className={cn(
            "absolute bottom-20 left-20 w-64 h-64 rounded-full mix-blend-multiply filter blur-xl animate-pulse",
            ui.blobSecondary,
          )}
          style={{ animationDelay: "2s" }}
        />
      </div>
      <DashboardPageShell>{inventoryBody}</DashboardPageShell>
    </div>
  )
}
