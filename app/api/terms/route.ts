import { NextResponse } from "next/server"

const TERMS_VERSION = "2026-05-07"

const POS_TERMS: { id: string; title: string; body: string }[] = [
  {
    id: "accurate-entry",
    title: "Accurate sales entry",
    body: "You agree to record sales accurately and avoid intentional manipulation of totals, stock, or reports.",
  },
  {
    id: "inventory-discipline",
    title: "Inventory discipline",
    body: "You will keep product quantities and prices updated and avoid selling items outside the system when inventory tracking is enabled.",
  },
  {
    id: "account-security",
    title: "Account security",
    body: "You are responsible for securing your login credentials and must not share passwords or allow unauthorized access.",
  },
  {
    id: "data-responsibility",
    title: "Data responsibility",
    body: "You are responsible for the correctness of business information entered (products, prices, transactions).",
  },
  {
    id: "fair-use",
    title: "Fair use",
    body: "You will not abuse the system (spam, scraping, tampering, attempted bypass of controls). Violations may lead to suspension.",
  },
  {
    id: "compliance",
    title: "Compliance",
    body: "You will comply with applicable tax and business regulations in your jurisdiction when using the POS.",
  },
  {
    id: "service-availability",
    title: "Service availability",
    body: "Service may be interrupted for maintenance or upgrades; we aim to minimize downtime but cannot guarantee uninterrupted access.",
  },
]

export async function GET() {
  return NextResponse.json({
    version: TERMS_VERSION,
    items: POS_TERMS,
  })
}

