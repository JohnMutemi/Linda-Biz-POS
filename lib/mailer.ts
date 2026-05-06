import nodemailer from "nodemailer"

type LoginRouteEmailInput = {
  to: string
  recipientName: string
  loginUrl: string
}

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.APP_URL ||
    "http://localhost:3000"
  )
}

export function buildLoginUrl(token: string, email: string) {
  const baseUrl = getBaseUrl().replace(/\/+$/, "")
  const params = new URLSearchParams({
    tab: "login",
    email,
    invite: token,
  })
  return `${baseUrl}/login?${params.toString()}`
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
