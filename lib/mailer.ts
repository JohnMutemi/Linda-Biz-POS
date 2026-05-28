import nodemailer from "nodemailer"

type LoginRouteEmailInput = {
  to: string
  recipientName: string
  loginUrl: string
}

type ApprovedAccessEmailInput = {
  to: string
  recipientName: string
  userLoginUrl: string
  ownerAdminLoginUrl: string
  ownerAdminEmail: string
  ownerAdminPassword: string
}

type BusinessAdminCredentialsEmailInput = {
  to: string
  recipientName: string
  ownerAdminLoginUrl: string
  ownerAdminEmail: string
  ownerAdminPassword: string
}

type PasswordResetEmailInput = {
  to: string
  recipientName: string
  resetUrl: string
}

type SaleNotificationEmailItem = {
  productName: string
  quantity: number
  subtotal: number
}

type SaleNotificationEmailInput = {
  to: string
  recipientName: string
  businessName: string
  saleId: string
  soldAt: string
  total: number
  itemCount: number
  items: SaleNotificationEmailItem[]
  salesPageUrl: string
  reportDownloadUrl: string
}

type ProductChangeType = "created" | "updated" | "deleted" | "merged" | "adjusted"

type ProductChangeSnapshot = {
  id: string
  name: string
  category?: string
  unit?: string
  price?: number
  quantity?: number
  reorderLevel?: number
}

type ProductChangeEmailInput = {
  to: string
  recipientName: string
  businessName: string
  changeType: ProductChangeType
  changedAt: string
  actorNote?: string
  before?: ProductChangeSnapshot
  after?: ProductChangeSnapshot
  productsPageUrl: string
}

function getBaseUrl(fallbackOrigin?: string) {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.APP_URL ||
    fallbackOrigin ||
    "http://localhost:3000"
  )
}

export function buildLoginUrl(token: string, email: string, fallbackOrigin?: string) {
  const baseUrl = getBaseUrl(fallbackOrigin).replace(/\/+$/, "")
  const params = new URLSearchParams({
    tab: "login",
    email,
    invite: token,
  })
  return `${baseUrl}/login?${params.toString()}`
}

export function buildPasswordResetUrl(token: string, email: string, fallbackOrigin?: string) {
  const baseUrl = getBaseUrl(fallbackOrigin).replace(/\/+$/, "")
  const params = new URLSearchParams({ token, email })
  return `${baseUrl}/reset-password?${params.toString()}`
}

export function buildOwnerAdminLoginUrl(email: string, fallbackOrigin?: string) {
  const baseUrl = getBaseUrl(fallbackOrigin).replace(/\/+$/, "")
  const params = new URLSearchParams({ email })
  return `${baseUrl}/business-admin/login?${params.toString()}`
}

export function buildSalesPageUrl(fallbackOrigin?: string) {
  const baseUrl = getBaseUrl(fallbackOrigin).replace(/\/+$/, "")
  return `${baseUrl}/sales`
}

export function buildSalesReportDownloadUrl(userId: string, filterType: "today" | "week" | "month" | "custom" = "today", fallbackOrigin?: string) {
  const baseUrl = getBaseUrl(fallbackOrigin).replace(/\/+$/, "")
  const params = new URLSearchParams({
    userId,
    filterType,
    periodLabel: filterType === "today" ? `Today (${new Date().toLocaleDateString()})` : "Recent Sales",
  })
  return `${baseUrl}/api/sales/report/pdf?${params.toString()}`
}

export function buildProductsPageUrl(fallbackOrigin?: string) {
  const baseUrl = getBaseUrl(fallbackOrigin).replace(/\/+$/, "")
  return `${baseUrl}/dashboard`
}

export async function sendLoginRouteEmail({ to, recipientName, loginUrl }: LoginRouteEmailInput) {
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = Number(process.env.SMTP_PORT || "587")
  const smtpSecure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true"
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const fromEmail = process.env.EMAIL_FROM_EMAIL || process.env.AUTH_FROM_EMAIL || smtpUser
  const fromName = process.env.EMAIL_FROM_NAME || "LindaBiz Support"

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !fromEmail) {
    return {
      sent: false,
      reason: "SMTP provider not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and EMAIL_FROM_EMAIL.",
    }
  }

  const subject = "Your LindaBiz login access is now approved"
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a;">
      <h2 style="color: #065f46;">Hi ${recipientName},</h2>
      <p>Your account has been approved by our admin team.</p>
      <p>Use the button below to access the login page and sign in with the password you chose during registration.</p>
      <p style="margin: 24px 0;">
        <a href="${loginUrl}" style="background: #059669; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none; display: inline-block;">
          Open Login Page
        </a>
      </p>
      <p>If the button does not work, copy this URL:</p>
      <p><a href="${loginUrl}">${loginUrl}</a></p>
    </div>
  `

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  })

  try {
    await transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to,
      subject,
      html,
    })
  } catch (error) {
    return {
      sent: false,
      reason: error instanceof Error ? `SMTP send failed: ${error.message}` : "SMTP send failed.",
    }
  }

  return { sent: true as const }
}

export async function sendApprovedAccessEmail({
  to,
  recipientName,
  userLoginUrl,
  ownerAdminLoginUrl,
  ownerAdminEmail,
  ownerAdminPassword,
}: ApprovedAccessEmailInput) {
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = Number(process.env.SMTP_PORT || "587")
  const smtpSecure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true"
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const fromEmail = process.env.EMAIL_FROM_EMAIL || process.env.AUTH_FROM_EMAIL || smtpUser
  const fromName = process.env.EMAIL_FROM_NAME || "LindaBiz Support"

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !fromEmail) {
    return {
      sent: false,
      reason: "SMTP provider not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and EMAIL_FROM_EMAIL.",
    }
  }

  const subject = "Your LindaBiz account is approved (user + business admin access)"
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; color: #0f172a;">
      <h2 style="color: #065f46;">Hi ${recipientName},</h2>
      <p>Your account has been approved by the LindaBiz superadmin team.</p>
      <p>You now have <strong>two access points</strong>:</p>
      <ol>
        <li><strong>Main user dashboard</strong> (for regular day-to-day operations)</li>
        <li><strong>Business admin panel</strong> (for owner-level visibility and controls)</li>
      </ol>
      <div style="margin: 18px 0; padding: 14px; border: 1px solid #d1fae5; border-radius: 10px; background: #ecfdf5;">
        <p style="margin: 0 0 8px 0; font-weight: 700;">Business admin credentials</p>
        <p style="margin: 0;"><strong>Email:</strong> ${ownerAdminEmail}</p>
        <p style="margin: 0;"><strong>Temporary password:</strong> ${ownerAdminPassword}</p>
      </div>
      <p style="margin: 22px 0;">
        <a href="${userLoginUrl}" style="background: #059669; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none; display: inline-block; margin-right: 8px;">
          Open Main Login
        </a>
        <a href="${ownerAdminLoginUrl}" style="background: #0f172a; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none; display: inline-block;">
          Open Business Admin Login
        </a>
      </p>
      <p>If buttons do not work, copy these links:</p>
      <p>User login: <a href="${userLoginUrl}">${userLoginUrl}</a></p>
      <p>Business admin login: <a href="${ownerAdminLoginUrl}">${ownerAdminLoginUrl}</a></p>
    </div>
  `

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  })

  try {
    await transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to,
      subject,
      html,
    })
  } catch (error) {
    return {
      sent: false,
      reason: error instanceof Error ? `SMTP send failed: ${error.message}` : "SMTP send failed.",
    }
  }

  return { sent: true as const }
}

export async function sendBusinessAdminCredentialsEmail({
  to,
  recipientName,
  ownerAdminLoginUrl,
  ownerAdminEmail,
  ownerAdminPassword,
}: BusinessAdminCredentialsEmailInput) {
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = Number(process.env.SMTP_PORT || "587")
  const smtpSecure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true"
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const fromEmail = process.env.EMAIL_FROM_EMAIL || process.env.AUTH_FROM_EMAIL || smtpUser
  const fromName = process.env.EMAIL_FROM_NAME || "LindaBiz Support"

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !fromEmail) {
    return {
      sent: false,
      reason: "SMTP provider not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and EMAIL_FROM_EMAIL.",
    }
  }

  const subject = "Your LindaBiz business admin credentials"
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; color: #0f172a;">
      <h2 style="color: #065f46;">Hi ${recipientName},</h2>
      <p>Your <strong>business admin</strong> access has been issued (or re-issued).</p>
      <div style="margin: 18px 0; padding: 14px; border: 1px solid #d1fae5; border-radius: 10px; background: #ecfdf5;">
        <p style="margin: 0 0 8px 0; font-weight: 700;">Business admin credentials</p>
        <p style="margin: 0;"><strong>Email:</strong> ${ownerAdminEmail}</p>
        <p style="margin: 0;"><strong>Temporary password:</strong> ${ownerAdminPassword}</p>
      </div>
      <p style="margin: 22px 0;">
        <a href="${ownerAdminLoginUrl}" style="background: #0f172a; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none; display: inline-block;">
          Open Business Admin Login
        </a>
      </p>
      <p>For security, you will be asked to set a new password after you sign in.</p>
      <p>If the button does not work, copy this link:</p>
      <p><a href="${ownerAdminLoginUrl}">${ownerAdminLoginUrl}</a></p>
    </div>
  `

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  })

  try {
    await transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to,
      subject,
      html,
    })
  } catch (error) {
    return {
      sent: false,
      reason: error instanceof Error ? `SMTP send failed: ${error.message}` : "SMTP send failed.",
    }
  }

  return { sent: true as const }
}

export async function sendPasswordResetEmail({ to, recipientName, resetUrl }: PasswordResetEmailInput) {
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = Number(process.env.SMTP_PORT || "587")
  const smtpSecure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true"
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const fromEmail = process.env.EMAIL_FROM_EMAIL || process.env.AUTH_FROM_EMAIL || smtpUser
  const fromName = process.env.EMAIL_FROM_NAME || "LindaBiz Support"

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !fromEmail) {
    return {
      sent: false,
      reason: "SMTP provider not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and EMAIL_FROM_EMAIL.",
    }
  }

  const subject = "Reset your LindaBiz password"
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a;">
      <h2 style="color: #065f46;">Hi ${recipientName},</h2>
      <p>We received a request to reset your password.</p>
      <p style="margin: 24px 0;">
        <a href="${resetUrl}" style="background: #059669; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none; display: inline-block;">
          Reset Password
        </a>
      </p>
      <p>If the button does not work, copy this URL:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p style="margin-top: 24px; font-size: 12px; color: #475569;">If you did not request a password reset, you can ignore this email.</p>
    </div>
  `

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  })

  try {
    await transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to,
      subject,
      html,
    })
  } catch (error) {
    return {
      sent: false,
      reason: error instanceof Error ? `SMTP send failed: ${error.message}` : "SMTP send failed.",
    }
  }

  return { sent: true as const }
}

export async function sendSaleNotificationEmail({
  to,
  recipientName,
  businessName,
  saleId,
  soldAt,
  total,
  itemCount,
  items,
  salesPageUrl,
  reportDownloadUrl,
}: SaleNotificationEmailInput) {
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = Number(process.env.SMTP_PORT || "587")
  const smtpSecure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true"
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const fromEmail = process.env.EMAIL_FROM_EMAIL || process.env.AUTH_FROM_EMAIL || smtpUser
  const fromName = process.env.EMAIL_FROM_NAME || "LindaBiz Support"

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !fromEmail) {
    return {
      sent: false,
      reason: "SMTP provider not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and EMAIL_FROM_EMAIL.",
    }
  }

  const subject = `New sale recorded - ${businessName || "Your business"}`
  const itemRows = items
    .slice(0, 8)
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${item.productName}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">KSh ${Math.round(item.subtotal).toLocaleString()}</td>
      </tr>`,
    )
    .join("")

  const remaining = items.length > 8 ? `<p style="font-size: 12px; color: #475569;">+ ${items.length - 8} more item(s)</p>` : ""

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; color: #0f172a;">
      <h2 style="color: #065f46;">Hi ${recipientName},</h2>
      <p>A new sale has just been recorded for <strong>${businessName || "your business"}</strong>.</p>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin: 16px 0;">
        <p style="margin: 0 0 8px 0;"><strong>Sale ID:</strong> ${saleId}</p>
        <p style="margin: 0 0 8px 0;"><strong>Time:</strong> ${soldAt}</p>
        <p style="margin: 0 0 8px 0;"><strong>Items:</strong> ${itemCount}</p>
        <p style="margin: 0;"><strong>Total:</strong> KSh ${Math.round(total).toLocaleString()}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <thead>
          <tr style="background: #ecfdf5;">
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #cbd5e1;">Item</th>
            <th style="padding: 8px; text-align: center; border-bottom: 1px solid #cbd5e1;">Qty</th>
            <th style="padding: 8px; text-align: right; border-bottom: 1px solid #cbd5e1;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows || `<tr><td colspan="3" style="padding: 8px; color: #64748b;">No sale items attached.</td></tr>`}
        </tbody>
      </table>
      ${remaining}

      <p style="margin: 24px 0;">
        <a href="${reportDownloadUrl}" style="background: #059669; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none; display: inline-block; margin-right: 8px;">
          Download Today's Report
        </a>
        <a href="${salesPageUrl}" style="background: #0f172a; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none; display: inline-block;">
          Open Sales Dashboard
        </a>
      </p>

      <p style="font-size: 12px; color: #64748b;">You may be asked to sign in before opening secure links.</p>
    </div>
  `

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  })

  try {
    await transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to,
      subject,
      html,
    })
  } catch (error) {
    return {
      sent: false,
      reason: error instanceof Error ? `SMTP send failed: ${error.message}` : "SMTP send failed.",
    }
  }

  return { sent: true as const }
}

export async function sendProductChangeEmail({
  to,
  recipientName,
  businessName,
  changeType,
  changedAt,
  actorNote,
  before,
  after,
  productsPageUrl,
}: ProductChangeEmailInput) {
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = Number(process.env.SMTP_PORT || "587")
  const smtpSecure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true"
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const fromEmail = process.env.EMAIL_FROM_EMAIL || process.env.AUTH_FROM_EMAIL || smtpUser
  const fromName = process.env.EMAIL_FROM_NAME || "LindaBiz Support"

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !fromEmail) {
    return {
      sent: false,
      reason: "SMTP provider not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and EMAIL_FROM_EMAIL.",
    }
  }

  const titleMap: Record<ProductChangeType, string> = {
    created: "Product created",
    updated: "Product updated",
    deleted: "Product deleted",
    merged: "Product stock merged",
    adjusted: "Product stock adjusted",
  }
  const subject = `${titleMap[changeType]} - ${businessName || "Your business"}`

  const formatMoney = (value: unknown) => (Number.isFinite(Number(value)) ? `KSh ${Math.round(Number(value)).toLocaleString()}` : "—")
  const formatNumber = (value: unknown) => (Number.isFinite(Number(value)) ? `${Number(value)}` : "—")

  const renderSnapshot = (label: string, snap?: ProductChangeSnapshot) => {
    if (!snap) return ""
    return `
      <div style="border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; margin-top: 10px; background: #ffffff;">
        <p style="margin: 0 0 8px 0; font-weight: 700; color: #0f172a;">${label}</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #0f172a;">
          <tr><td style="padding: 4px 0; color: #64748b;">Product</td><td style="padding: 4px 0; text-align: right;">${snap.name}</td></tr>
          <tr><td style="padding: 4px 0; color: #64748b;">Category</td><td style="padding: 4px 0; text-align: right;">${snap.category ?? "—"}</td></tr>
          <tr><td style="padding: 4px 0; color: #64748b;">Unit</td><td style="padding: 4px 0; text-align: right;">${snap.unit ?? "—"}</td></tr>
          <tr><td style="padding: 4px 0; color: #64748b;">Price</td><td style="padding: 4px 0; text-align: right;">${formatMoney(snap.price)}</td></tr>
          <tr><td style="padding: 4px 0; color: #64748b;">Quantity</td><td style="padding: 4px 0; text-align: right;">${formatNumber(snap.quantity)}</td></tr>
          <tr><td style="padding: 4px 0; color: #64748b;">Reorder level</td><td style="padding: 4px 0; text-align: right;">${formatNumber(snap.reorderLevel)}</td></tr>
        </table>
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #64748b;">ID: ${snap.id}</p>
      </div>
    `
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; color: #0f172a;">
      <h2 style="color: #0f172a;">Hi ${recipientName},</h2>
      <p style="margin: 0 0 8px 0;">
        <strong>${titleMap[changeType]}</strong> for <strong>${businessName || "your business"}</strong>.
      </p>
      <p style="margin: 0; color: #475569; font-size: 13px;">Time: ${changedAt}</p>
      ${actorNote ? `<p style="margin-top: 8px; color: #475569; font-size: 13px;">${actorNote}</p>` : ""}

      ${renderSnapshot("Before", before)}
      ${renderSnapshot("After", after)}

      <p style="margin: 18px 0;">
        <a href="${productsPageUrl}" style="background: #0f172a; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none; display: inline-block;">
          Open Dashboard
        </a>
      </p>

      <p style="font-size: 12px; color: #64748b;">
        If you did not authorize this change, please review user access immediately.
      </p>
    </div>
  `

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  })

  try {
    await transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to,
      subject,
      html,
    })
  } catch (error) {
    return {
      sent: false,
      reason: error instanceof Error ? `SMTP send failed: ${error.message}` : "SMTP send failed.",
    }
  }

  return { sent: true as const }
}
