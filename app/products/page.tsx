"use client"

import type React from "react"

import { useCallback, useEffect, useState } from "react"
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [user, setUser] = useState<any>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showPopularItems, setShowPopularItems] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
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
    // Get current user
    const userData = localStorage.getItem("lindabiz_user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      void loadProducts(parsedUser.id)
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-700">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 -z-10"></div>

      {/* Subtle decorative elements */}
      <div className="fixed inset-0 opacity-20 -z-10">
        <div className="absolute top-20 right-20 w-64 h-64 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div
          className="absolute bottom-20 left-20 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <DashboardPageShell>
        <div className="space-y-6">
          <div className="dashboard-sticky-header flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-emerald-900">Products</h1>
              <p className="text-emerald-700">Manage your inventory</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <BackToDashboardButton className="order-2 sm:order-1" label="Dashboard" />
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
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium order-1 sm:order-2"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>
          <Card className="bg-white/80 backdrop-blur-sm border-emerald-100">
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by product, category, or unit..."
                    className="h-11 border-emerald-200 pl-10 text-sm focus-visible:ring-emerald-300"
                  />
                </div>
                <Badge variant="outline" className="w-fit border-emerald-200 bg-emerald-50 text-emerald-700">
                  {filteredProducts.length} / {products.length} shown
                </Badge>
              </div>
            </CardContent>
          </Card>

          {products.length === 0 ? (
            <Card className="bg-white/70 backdrop-blur-sm border-emerald-100">
              <CardContent className="flex flex-col items-center justify-center py-12 px-4">
                <div className="bg-emerald-50 p-4 rounded-full mb-4">
                  <Package className="h-12 w-12 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-emerald-900 mb-2 text-center">No products yet</h3>
                <p className="text-emerald-700 text-center mb-6 max-w-md">
                  Start by adding your first product to begin managing your inventory and tracking sales.
                </p>
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
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Product
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl border border-emerald-100 bg-white/80 px-4 py-3">
                <p className="flex items-center text-sm font-semibold text-emerald-900">
                  <Sparkles className="mr-2 h-4 w-4 shrink-0 text-emerald-600" />
                  All products
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-emerald-700 md:hidden">
                  Card layout on your phone — tap Edit or Delete below each item.
                </p>
                <p className="mt-0.5 hidden text-xs text-emerald-700 md:block">
                  Full table: scroll horizontally if columns don&apos;t fit.
                </p>
              </div>

              <div className="space-y-3 md:hidden">
                {filteredProducts.map((product) => {
                  const rl = reorderThreshold(product)
                  const status = isOutOfStock(product) ? "out" : isLowStock(product) ? "low" : "ok"
                  return (
                    <Card key={product.id} className="border-emerald-100 bg-white/90 shadow-sm">
                      <CardContent className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-emerald-950">{product.name}</p>
                            <p className="mt-1 text-sm text-emerald-700">{product.category}</p>
                            <p className="mt-0.5 text-xs text-emerald-600">Unit: {product.unit}</p>
                          </div>
                          <Badge
                            variant={status === "out" ? "destructive" : "outline"}
                            className={
                              status === "low"
                                ? "shrink-0 bg-amber-100 text-amber-900 border-amber-300"
                                : status === "ok"
                                  ? "shrink-0 border-emerald-200 bg-emerald-50 text-emerald-800"
                                  : "shrink-0"
                            }
                          >
                            {status === "out" ? "Out" : status === "low" ? "Low" : "OK"}
                          </Badge>
                        </div>
                        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-emerald-900">
                          <div>
                            <dt className="text-emerald-600">Qty</dt>
                            <dd className="font-medium tabular-nums">
                              {product.quantity} {product.unit}
                              {product.quantity === 1 ? "" : "s"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-emerald-600">Reorder</dt>
                            <dd className="font-medium tabular-nums">{rl}</dd>
                          </div>
                          <div className="col-span-2">
                            <dt className="text-emerald-600">Price</dt>
                            <dd className="font-semibold tabular-nums">KSh {product.price.toLocaleString()}</dd>
                          </div>
                          <div className="col-span-2">
                            <dt className="text-emerald-600">Notes</dt>
                            <dd className="text-sm leading-snug text-emerald-800">
                              {product.description?.trim() ? product.description : "—"}
                            </dd>
                          </div>
                        </dl>
                        <div className="flex gap-2 pt-1">
                          <Button
                            variant="outline"
                            className="min-h-11 flex-1 touch-manipulation border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            className="min-h-11 flex-1 touch-manipulation border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <Card className="hidden overflow-hidden border-emerald-100 bg-white/85 shadow-sm backdrop-blur-sm md:block">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] text-left text-sm">
                      <thead className="border-b border-emerald-100 bg-emerald-50/90">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-emerald-900">Product</th>
                          <th className="px-4 py-3 font-semibold text-emerald-900">Category</th>
                          <th className="px-4 py-3 font-semibold text-emerald-900 whitespace-nowrap">Quantity</th>
                          <th className="px-4 py-3 font-semibold text-emerald-900 whitespace-nowrap">Price</th>
                          <th className="px-4 py-3 font-semibold text-emerald-900 whitespace-nowrap">Reorder</th>
                          <th className="px-4 py-3 font-semibold text-emerald-900">Status</th>
                          <th className="px-4 py-3 font-semibold text-emerald-900 min-w-[160px]">Description</th>
                          <th className="px-4 py-3 font-semibold text-emerald-900 text-right whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product, rowIdx) => {
                          const rl = reorderThreshold(product)
                          const status =
                            isOutOfStock(product) ? "out" : isLowStock(product) ? "low" : "ok"
                          return (
                            <tr
                              key={product.id}
                              className={rowIdx % 2 === 0 ? "bg-white/90" : "bg-emerald-50/35 border-t border-emerald-100/50"}
                            >
                              <td className="px-4 py-3 align-top">
                                <p className="font-semibold text-emerald-950">{product.name}</p>
                                <p className="text-xs text-emerald-600 mt-0.5">Unit: {product.unit}</p>
                              </td>
                              <td className="px-4 py-3 align-top text-emerald-800">{product.category}</td>
                              <td className="px-4 py-3 align-top whitespace-nowrap tabular-nums font-medium text-emerald-950">
                                {product.quantity}{" "}
                                <span className="font-normal text-emerald-600">
                                  {product.unit}
                                  {product.quantity === 1 ? "" : "s"}
                                </span>
                              </td>
                              <td className="px-4 py-3 align-top whitespace-nowrap tabular-nums text-emerald-900">
                                KSh {product.price.toLocaleString()}
                              </td>
                              <td className="px-4 py-3 align-top whitespace-nowrap text-emerald-700 tabular-nums">{rl}</td>
                              <td className="px-4 py-3 align-top">
                                <Badge
                                  variant={status === "out" ? "destructive" : "outline"}
                                  className={
                                    status === "low"
                                      ? "bg-amber-100 text-amber-900 border-amber-300"
                                      : status === "ok"
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                        : ""
                                  }
                                >
                                  {status === "out" ? "Out of stock" : status === "low" ? "Low stock" : "In stock"}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 align-top max-w-[220px]">
                                <p className="line-clamp-2 text-emerald-800">{product.description?.trim() ? product.description : "—"}</p>
                              </td>
                              <td className="px-4 py-3 align-top">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(product)}
                                    className="border-emerald-200 hover:bg-emerald-50 text-emerald-700"
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(product.id)}
                                    className="border-red-200 hover:bg-red-50 text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              {filteredProducts.length === 0 && (
                <Card className="bg-white/80 backdrop-blur-sm border-emerald-100">
                  <CardContent className="py-10 text-center text-emerald-700">
                    <Search className="mx-auto mb-3 h-8 w-8 text-emerald-400" />
                    No products match your search.
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </DashboardPageShell>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-white/95 backdrop-blur-sm border-emerald-100 max-w-md mx-4 sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-emerald-900">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription className="text-emerald-700">
              {editingProduct ? "Update product information" : "Add a new product to your inventory"}
            </DialogDescription>
          </DialogHeader>

          {/* Popular Items Section */}
          {!editingProduct && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-emerald-900">Quick Add Popular Items</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPopularItems(!showPopularItems)}
                  className="border-emerald-200 hover:bg-emerald-50"
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  {showPopularItems ? "Hide" : "Show"} Items
                </Button>
              </div>

              {showPopularItems && (
                <Card className="bg-emerald-50/50 border-emerald-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-emerald-800">Starter catalogue shortcuts</CardTitle>
                    <CardDescription className="text-emerald-600">
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
                          className="justify-start text-left h-auto p-3 border-emerald-200 hover:bg-emerald-100"
                        >
                          <div className="flex flex-col items-start">
                            <span className="font-medium text-emerald-900">{item.name}</span>
                            <span className="text-xs text-emerald-600">
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
                className="border-emerald-200 focus:border-emerald-400"
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
                  className="border-emerald-200 focus:border-emerald-400"
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
                  className="border-emerald-200 focus:border-emerald-400"
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
                  <SelectTrigger className="border-emerald-200 focus:border-emerald-400">
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
                  <SelectTrigger className="border-emerald-200 focus:border-emerald-400">
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
                className="border-emerald-200 focus:border-emerald-400"
              />
              <p className="text-xs text-emerald-600">
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
                className="border-emerald-200 focus:border-emerald-400"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="border-emerald-200 hover:bg-emerald-50"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                {editingProduct ? "Update Product" : "Add Product"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
