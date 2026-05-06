"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb, RefreshCw, X } from "lucide-react"

interface BusinessTipProps {
  userType: "general" | "wines-spirits"
}

export function BusinessTip({ userType }: BusinessTipProps) {
  const [tip, setTip] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Business tips for general shops
  const generalShopTips = [
    "Keep your most popular items at eye level to increase sales.",
    "Track your inventory daily to avoid running out of bestsellers.",
    "Offer bundle deals to increase your average transaction value.",
    "Keep your shop clean and well-organized to attract more customers.",
    "Build relationships with your suppliers for better pricing and terms.",
    "Consider offering credit to trusted regular customers to build loyalty.",
    "Display prices clearly to build customer trust and reduce haggling time.",
    "Stock seasonal items ahead of time to maximize holiday sales.",
    "Keep a customer feedback book to understand what products they want.",
    "Rotate your stock regularly to ensure freshness, especially for perishables.",
    "Use attractive displays near the entrance to draw customers in.",
    "Keep small change ready to avoid losing sales due to payment issues.",
    "Monitor your competitors' prices to stay competitive in the market.",
    "Invest in good lighting to make your products more appealing.",
    "Train yourself to upsell complementary items to increase revenue.",
    "Keep emergency stock of fast-moving items to avoid stockouts.",
    "Maintain good relationships with customers - word of mouth is powerful.",
    "Consider opening early and closing late to capture more sales.",
    "Keep detailed records of what sells best during different times.",
    "Offer convenience services like mobile money to attract tech-savvy customers.",
  ]

  // Business tips for wines & spirits
  const winesSpiritsTips = [
    "Know your products well - customers appreciate knowledgeable recommendations.",
    "Keep premium products secure but visible to prevent theft while encouraging sales.",
    "Maintain proper storage conditions to preserve product quality and taste.",
    "Build relationships with event planners and party organizers for bulk sales.",
    "Offer gift wrapping services during holidays to add value.",
    "Keep a variety of price points to cater to different customer budgets.",
    "Learn about wine and spirit pairings to provide expert advice.",
    "Stock popular local brands alongside international ones.",
    "Offer loyalty programs for regular customers to encourage repeat business.",
    "Keep your licenses and permits up to date to avoid legal issues.",
    "Consider offering delivery services for large orders or events.",
    "Display products by category and price range for easy browsing.",
    "Keep track of expiration dates, especially for wines with vintage years.",
    "Offer tasting events to introduce customers to new products.",
    "Partner with local restaurants to supply their beverage needs.",
    "Keep your shop well-lit and secure with proper surveillance.",
    "Stock mixers and accessories to increase basket size.",
    "Know the peak seasons for different types of alcohol sales.",
    "Maintain good relationships with distributors for exclusive deals.",
    "Consider offering corporate packages for office parties and events.",
  ]

  const generateTip = () => {
    setIsLoading(true)
    const tips = userType === "wines-spirits" ? winesSpiritsTips : generalShopTips
    const randomTip = tips[Math.floor(Math.random() * tips.length)]

    // Simulate loading for better UX
    setTimeout(() => {
      setTip(randomTip)
      setIsLoading(false)
    }, 500)
  }

  useEffect(() => {
    // Check if user has seen a tip today
    const today = new Date().toDateString()
    const lastTipDate = localStorage.getItem("lindabiz_last_tip_date")
    const hasSeenTipToday = lastTipDate === today

    if (!hasSeenTipToday) {
      generateTip()
      setIsVisible(true)
      localStorage.setItem("lindabiz_last_tip_date", today)
    }
  }, [userType])

  const handleDismiss = () => {
    setIsVisible(false)
  }

  const handleNewTip = () => {
    generateTip()
  }

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setIsVisible(true)
          if (!tip) generateTip()
        }}
        className="fixed bottom-4 right-4 z-40 border-emerald-200 hover:bg-emerald-50 bg-white/90 backdrop-blur-sm sm:right-6"
      >
        <Lightbulb className="h-4 w-4 mr-2 text-emerald-600" />
        Business Tip
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-3 z-40 w-[min(92vw,22rem)] bg-white/95 backdrop-blur-sm border-emerald-200 shadow-lg sm:right-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-emerald-900 flex items-center text-sm">
            <Lightbulb className="h-4 w-4 mr-2 text-emerald-600" />
            Business Tip of the Day
          </CardTitle>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewTip}
              disabled={isLoading}
              className="h-6 w-6 p-0 hover:bg-emerald-50"
            >
              <RefreshCw className={`h-3 w-3 text-emerald-600 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDismiss} className="h-6 w-6 p-0 hover:bg-emerald-50">
              <X className="h-3 w-3 text-emerald-600" />
            </Button>
          </div>
        </div>
        <CardDescription className="text-emerald-600 text-xs">
          {userType === "wines-spirits" ? "For Wines & Spirits Vendors" : "For General Shop Owners"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <p className="text-sm text-emerald-800 leading-relaxed">{tip}</p>
        )}
      </CardContent>
    </Card>
  )
}
