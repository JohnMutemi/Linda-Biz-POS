import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { DashboardProvider } from "@/components/dashboard/dashboard-provider"
import { WhatsAppWidget } from "@/components/whatsapp-widget"
import { ChunkErrorReloader } from "@/components/chunk-error-reloader"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LindaBiz POS",
  description: "Simplified Point of Sale for Small Scale Vendors",
  generator: "v0.app",
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover" as const,
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
        <ChunkErrorReloader />
        <WhatsAppWidget />
        <Toaster />
      </body>
    </html>
  )
}
