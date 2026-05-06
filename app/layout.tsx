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
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var KEY = "lindabiz_chunk_bootstrap_reload_once";
                var shouldReload = function () {
                  try {
                    if (sessionStorage.getItem(KEY) === "1") return false;
                    sessionStorage.setItem(KEY, "1");
                    return true;
                  } catch (e) {
                    return false;
                  }
                };
                var isChunkMessage = function (msg) {
                  return typeof msg === "string" && (msg.indexOf("ChunkLoadError") !== -1 || msg.indexOf("Loading chunk") !== -1 || msg.indexOf("Chunk load failed") !== -1);
                };
                window.addEventListener("error", function (event) {
                  var message = (event && event.message) || "";
                  if (isChunkMessage(message) && shouldReload()) {
                    window.location.reload();
                  }
                });
                window.addEventListener("unhandledrejection", function (event) {
                  var reason = event && event.reason;
                  var message = typeof reason === "string" ? reason : (reason && reason.message) || "";
                  var target = reason && reason.target;
                  var src = "";
                  if (target && typeof target.src === "string") src = target.src;
                  if (!src && target && typeof target.href === "string") src = target.href;
                  if ((src && src.indexOf("/_next/static/") !== -1) || isChunkMessage(message)) {
                    event.preventDefault();
                    if (shouldReload()) {
                      window.location.reload();
                    }
                  }
                });
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <DashboardProvider>{children}</DashboardProvider>
        <ChunkErrorReloader />
        <WhatsAppWidget />
        <Toaster />
      </body>
    </html>
  )
}
