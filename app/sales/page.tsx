"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Plus, Minus, Trash2, Receipt } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { SalesReports } from "@/components/sales-reports"
import { BackToDashboardButton } from "@/components/dashboard/back-to-dashboard-button"
import { DashboardPageShell } from "@/components/dashboard/page-shell"

interface Product {
  id: string
  name: string
  price: number
  quantity: number
  unit: string
  category: string
  userType: "general" | "wines-spirits"
  userId: string
}

interface CartItem extends Product {
  cartQuantity: number
}

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [user, setUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const userData = localStorage.getItem("lindabiz_user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      void loadProducts(parsedUser.id)
    }

    const handleInventoryRefresh = () => {
      const currentUser = JSON.parse(localStorage.getItem("lindabiz_user") || "null")
      if (currentUser?.id) {
        void loadProducts(currentUser.id)
      }
    }

    window.addEventListener("inventory-refresh", handleInventoryRefresh)
    window.addEventListener("storage", handleInventoryRefresh)
    return () => {
      window.removeEventListener("inventory-refresh", handleInventoryRefresh)
      window.removeEventListener("storage", handleInventoryRefresh)
    }
  }, [])

  const loadProducts = async (userId: string) => {
    const response = await fetch(`/api/products?userId=${encodeURIComponent(userId)}`)
    if (!response.ok) {
      throw new Error("Failed to load products")
    }
    const allProducts: Product[] = await response.json()
    const userProducts = allProducts.filter((p) => p.quantity > 0)
    setProducts(userProducts)
  }

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id)

    if (existingItem) {
      if (existingItem.cartQuantity < product.quantity) {
        setCart((prev) =>
          prev.map((item) => (item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item)),
        )
        toast({
          title: "Added to cart",
          description: `${product.name} quantity increased`,
        })
      } else {
        toast({
          title: "Cannot add more",
          description: `Only ${product.quantity} ${product.unit}s available`,
          variant: "destructive",
        })
      }
    } else {
      setCart((prev) => [...prev, { ...product, cartQuantity: 1 }])
      toast({
        title: "Added to cart",
        description: `${product.name} added to cart`,
      })
    }
  }

  const updateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart((prev) => prev.filter((item) => item.id !== productId))
      return
    }

    const product = products.find((p) => p.id === productId)
    if (product && newQuantity <= product.quantity) {
      setCart((prev) => prev.map((item) => (item.id === productId ? { ...item, cartQuantity: newQuantity } : item)))
    } else {
      toast({
        title: "Insufficient stock",
        description: `Only ${product?.quantity} ${product?.unit}s available`,
        variant: "destructive",
      })
    }
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId))
    toast({
      title: "Item removed",
      description: "Item removed from cart",
    })
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.cartQuantity, 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.cartQuantity, 0)
  }

  // Direct checkout handler - no dialog, immediate processing
  const handleDirectCheckout = async () => {
    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to cart before checkout",
        variant: "destructive",
      })
      return
    }

    if (!user) {
      toast({
        title: "User not found",
        description: "Please log in again",
        variant: "destructive",
      })
      return
    }

    if (isProcessing) {
      return // Prevent double-clicks
    }

    setIsProcessing(true)

    try {
      // Get fresh product data
      const productsResponse = await fetch(`/api/products?userId=${encodeURIComponent(user.id)}`)
      if (!productsResponse.ok) {
        throw new Error("Failed to load products for checkout")
      }
      const allProducts: Product[] = await productsResponse.json()

      // Validate stock
      for (const cartItem of cart) {
        const currentProduct = allProducts.find((p: Product) => p.id === cartItem.id && p.userId === user.id)
        if (!currentProduct || currentProduct.quantity < cartItem.cartQuantity) {
          throw new Error(`Insufficient stock for ${cartItem.name}`)
        }
      }

      // Calculate totals
      const saleTotal = getCartTotal()
      const totalItemCount = getTotalItems()

      // Create sale record
      const sale = {
        id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        items: cart.map((item) => ({
          productId: item.id,
          productName: item.name,
          unitPrice: item.price,
          quantity: item.cartQuantity,
          unit: item.unit,
          category: item.category,
          subtotal: item.price * item.cartQuantity,
        })),
        total: saleTotal,
        date: new Date().toISOString(),
        userId: user.id,
        itemCount: totalItemCount,
      }

      // Save sale and apply stock updates server-side
      const saleResponse = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sale),
      })
      if (!saleResponse.ok) {
        throw new Error("Failed to complete sale")
      }

      // Clear cart and reload
      setCart([])
      await loadProducts(user.id)

      // Success message
      toast({
        title: "🎉 Sale Completed!",
        description: `Successfully sold ${totalItemCount} item${totalItemCount > 1 ? "s" : ""} for KSh ${saleTotal.toLocaleString()}`,
      })

      // Trigger dashboard refresh
      window.dispatchEvent(new Event("dashboard-refresh"))

      console.log("Sale completed successfully:", {
        saleId: sale.id,
        items: totalItemCount,
        total: saleTotal,
      })
    } catch (error) {
      console.error("Checkout error:", error)
      toast({
        title: "Checkout failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 -z-10"></div>

      <DashboardPageShell>
        {/* Header */}
        <div className="dashboard-sticky-header flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-emerald-900">Sales</h1>
            <p className="text-emerald-700">Process new sales and manage transactions</p>
          </div>
          <div className="flex items-center space-x-4">
            <BackToDashboardButton label="Dashboard" />
            <Badge variant="outline" className="text-lg px-3 py-1 border-emerald-200 bg-white/70">
              Cart: {cart.length} items
            </Badge>
            {/* Header Checkout Button */}
            {cart.length > 0 && (
              <Button
                onClick={handleDirectCheckout}
                disabled={isProcessing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Receipt className="mr-2 h-5 w-5" />
                    Checkout KSh {getCartTotal().toLocaleString()}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-white/70 backdrop-blur-sm border-emerald-100">
              <CardHeader>
                <CardTitle className="text-emerald-900">Available Products</CardTitle>
                <CardDescription className="text-emerald-700">Click to add products to cart</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-emerald-200 focus:border-emerald-400"
                  />
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-emerald-300 mx-auto mb-4" />
                    <p className="text-emerald-700">
                      {products.length === 0
                        ? "No products available. Add products first."
                        : "No products match your search."}
                    </p>
                    {products.length === 0 && (
                      <Button
                        className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => router.push("/products")}
                      >
                        Add Products
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-4 border border-emerald-100 rounded-lg hover:bg-emerald-50/50 bg-white/50 cursor-pointer"
                        onClick={() => addToCart(product)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-emerald-900">{product.name}</h3>
                            <Badge variant="outline" className="border-emerald-200">
                              {product.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-emerald-700">
                            KSh {product.price} per {product.unit} • {product.quantity} available
                          </p>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            addToCart(product)
                          }}
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cart Section */}
          <div className="space-y-4">
            <Card className="bg-white/70 backdrop-blur-sm border-emerald-100">
              <CardHeader>
                <CardTitle className="text-emerald-900">Shopping Cart</CardTitle>
                <CardDescription className="text-emerald-700">
                  {cart.length > 0 ? `${getTotalItems()} items ready for checkout` : "Cart is empty"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-8 w-8 text-emerald-300 mx-auto mb-2" />
                    <p className="text-emerald-700">Cart is empty</p>
                    <p className="text-sm text-emerald-600 mt-1">Click on products to add them</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Cart Items */}
                    {cart.map((item) => (
                      <div key={item.id} className="p-3 border border-emerald-100 rounded-lg bg-white/50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm text-emerald-900">{item.name}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCartQuantity(item.id, item.cartQuantity - 1)}
                              className="border-emerald-200 w-8 h-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center text-emerald-900">
                              {item.cartQuantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCartQuantity(item.id, item.cartQuantity + 1)}
                              disabled={item.cartQuantity >= item.quantity}
                              className="border-emerald-200 w-8 h-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-emerald-900">
                              KSh {(item.price * item.cartQuantity).toLocaleString()}
                            </p>
                            <p className="text-xs text-emerald-600">{item.quantity - item.cartQuantity} left</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Cart Summary and Checkout */}
                    <div className="border-t border-emerald-200 pt-4 space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-emerald-700">
                          <span>Total Items:</span>
                          <span>{getTotalItems()}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-emerald-900">
                          <span>Total Amount:</span>
                          <span>KSh {getCartTotal().toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Primary Checkout Button */}
                      <Button
                        onClick={handleDirectCheckout}
                        disabled={isProcessing}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 text-base"
                        size="lg"
                      >
                        {isProcessing ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Processing Sale...
                          </>
                        ) : (
                          <>
                            <Receipt className="mr-2 h-5 w-5" />
                            Complete Sale - KSh {getCartTotal().toLocaleString()}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Action Card */}
            {cart.length === 0 && (
              <Card className="bg-white/70 backdrop-blur-sm border-emerald-100">
                <CardHeader>
                  <CardTitle className="text-emerald-900 text-lg">Quick Start</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-emerald-700 mb-3">Get started with your first sale:</p>
                    <div className="space-y-2 text-sm text-emerald-600">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold mr-2">
                          1
                        </div>
                        Click on a product to add to cart
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold mr-2">
                          2
                        </div>
                        Adjust quantities as needed
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold mr-2">
                          3
                        </div>
                        Click &quot;Complete Sale&quot; to finish
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sales Reports Section */}
        <div className="mt-6">
          <SalesReports userId={user.id} userType={user.userType} businessName={user.businessName} />
        </div>
      </DashboardPageShell>
    </div>
  )
}
