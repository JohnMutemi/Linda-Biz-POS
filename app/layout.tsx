import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { DashboardProvider } from "@/components/dashboard/dashboard-provider"
import { WhatsAppWidget } from "@/components/whatsapp-widget"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LindaBiz POS",
  description: "Simplified Point of Sale for Small Scale Vendors",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <DashboardProvider>{children}</DashboardProvider>
        <WhatsAppWidget />
        <Toaster />
      </body>
    </html>
  )
}
