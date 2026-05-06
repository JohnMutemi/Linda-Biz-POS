"use client"

import { useEffect } from "react"

const CHUNK_RELOAD_KEY = "lindabiz_chunk_reload_once"

function isChunkErrorMessage(message: string) {
  return message.includes("ChunkLoadError") || message.includes("Loading chunk") || message.includes("Chunk load failed")
}

function isNextAssetUrl(value: string | null | undefined) {
  if (!value) return false
  return value.includes("/_next/static/")
}

export function ChunkErrorReloader() {
  useEffect(() => {
    const tryReload = (message: string) => {
      if (!isChunkErrorMessage(message)) return
      if (sessionStorage.getItem(CHUNK_RELOAD_KEY) === "1") return
      sessionStorage.setItem(CHUNK_RELOAD_KEY, "1")
      window.location.reload()
    }

    const handleError = (event: ErrorEvent) => {
      tryReload(event.message || event.error?.message || "")
    }

    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      if (reason instanceof Event) {
        const target = reason.target as HTMLScriptElement | HTMLLinkElement | null
        const failedSrc =
          target && "src" in target && typeof target.src === "string"
            ? target.src
            : target && "href" in target && typeof target.href === "string"
              ? target.href
              : ""
        if (isNextAssetUrl(failedSrc)) {
          event.preventDefault()
          tryReload("ChunkLoadError")
          return
        }
      }

      const message = typeof reason === "string" ? reason : reason?.message || ""
      if (isChunkErrorMessage(message)) {
        event.preventDefault()
      }
      tryReload(message)
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleRejection)
    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleRejection)
    }
  }, [])

  return null
}
