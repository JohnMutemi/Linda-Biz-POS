"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { CheckCircle2, Mail, ShieldCheck, UserCircle2, XCircle } from "lucide-react"
import { useDashboard } from "@/components/dashboard/dashboard-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

type ClientAccount = {
  id: string
  name: string
  email: string
  phone: string
  businessName: string
  location: string
  approvalStatus: "pending" | "approved" | "rejected"
  registrationDate: string
  approvedAt?: string | null
  approvedBy?: string | null
  loginRouteSentAt?: string | null
}

type AuditLog = {
  id: number
  clientId: string
  clientName: string
  clientEmail: string
  adminEmail: string
  action: string
  note: string
  createdAt: string
}

type AuditResponse = {
  page: number
  pageSize: number
  total: number
  totalPages: number
  actions: string[]
  admins: string[]
  items: AuditLog[]
}

export default function AdminPage() {
  const { user } = useDashboard()
  const { toast } = useToast()
  const [clients, setClients] = useState<ClientAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingAudit, setLoadingAudit] = useState(true)
  const [query, setQuery] = useState("")
  const [busyClientId, setBusyClientId] = useState<string | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [auditActions, setAuditActions] = useState<string[]>([])
  const [auditAdmins, setAuditAdmins] = useState<string[]>([])
  const [auditPage, setAuditPage] = useState(1)
  const [auditTotalPages, setAuditTotalPages] = useState(1)
  const [auditActionFilter, setAuditActionFilter] = useState("")
  const [auditAdminFilter, setAuditAdminFilter] = useState("")
  const [auditFrom, setAuditFrom] = useState("")
  const [auditTo, setAuditTo] = useState("")

  const loadClients = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/clients")
      if (!response.ok) {
        throw new Error("Failed to load client accounts.")
      }
      const data = (await response.json()) as ClientAccount[]
      setClients(data)
    } catch (error) {
      toast({
        title: "Unable to load clients",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void loadClients()
  }, [loadClients])

  const loadAuditLogs = useCallback(async () => {
    setLoadingAudit(true)
    try {
      const params = new URLSearchParams({
        page: String(auditPage),
        pageSize: "20",
      })
      if (auditActionFilter) params.set("action", auditActionFilter)
      if (auditAdminFilter) params.set("adminEmail", auditAdminFilter)
      if (auditFrom) params.set("from", auditFrom)
      if (auditTo) params.set("to", auditTo)

      const response = await fetch(`/api/admin/audit?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Failed to load audit history.")
      }
      const data = (await response.json()) as AuditResponse
      setAuditLogs(data.items)
      setAuditActions(data.actions)
      setAuditAdmins(data.admins)
      setAuditTotalPages(data.totalPages)
    } catch (error) {
      toast({
        title: "Unable to load audit history",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingAudit(false)
    }
  }, [toast, auditActionFilter, auditAdminFilter, auditFrom, auditPage, auditTo])

  useEffect(() => {
    void loadAuditLogs()
  }, [loadAuditLogs])

  useEffect(() => {
    setAuditPage(1)
  }, [auditActionFilter, auditAdminFilter, auditFrom, auditTo])

  const filteredClients = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!search) return clients
    return clients.filter((client) =>
      [client.name, client.email, client.businessName, client.location].join(" ").toLowerCase().includes(search),
    )
  }, [clients, query])

  const counts = useMemo(() => {
    return clients.reduce(
      (acc, client) => {
        acc.total += 1
        if (client.approvalStatus === "pending") acc.pending += 1
        if (client.approvalStatus === "approved") acc.approved += 1
        if (client.approvalStatus === "rejected") acc.rejected += 1
        return acc
      },
      { total: 0, pending: 0, approved: 0, rejected: 0 },
    )
  }, [clients])

  const runClientAction = async (clientId: string, action: "approve" | "reject" | "send-login-route") => {
    try {
      setBusyClientId(clientId)
      const response = await fetch(`/api/admin/clients/${clientId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Action failed")
      }

      const description =
        data.emailSent === false && data.loginUrl
          ? `${data.message} Share this link manually: ${data.loginUrl}`
          : data.message || "Action completed."

      toast({
        title: "Success",
        description,
      })
      await loadClients()
      await loadAuditLogs()
    } catch (error) {
      toast({
        title: "Action failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setBusyClientId(null)
    }
  }

  const statusBadge = (status: ClientAccount["approvalStatus"]) => {
    if (status === "approved") {
      return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Approved</Badge>
    }
    if (status === "rejected") {
      return <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100">Rejected</Badge>
    }
    return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>
  }

  return (
    <div className="dashboard-content-shell">
      <div className="dashboard-sticky-header mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-900">Admin</h1>
          <p className="mt-1 text-emerald-700">Admin-only area for approved accounts.</p>
        </div>
        <ShieldCheck className="h-8 w-8 text-emerald-600" />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-emerald-100 bg-white/90 p-4 shadow-sm">
          <p className="text-sm text-emerald-700">Total clients</p>
          <p className="text-2xl font-bold text-emerald-900">{counts.total}</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-white/90 p-4 shadow-sm">
          <p className="text-sm text-amber-700">Pending approvals</p>
          <p className="text-2xl font-bold text-amber-900">{counts.pending}</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-white/90 p-4 shadow-sm">
          <p className="text-sm text-emerald-700">Approved clients</p>
          <p className="text-2xl font-bold text-emerald-900">{counts.approved}</p>
        </div>
        <div className="rounded-xl border border-rose-100 bg-white/90 p-4 shadow-sm">
          <p className="text-sm text-rose-700">Rejected</p>
          <p className="text-2xl font-bold text-rose-900">{counts.rejected}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-emerald-100 bg-white/85 p-6 shadow-sm backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-emerald-900">Current session</h2>
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
          <UserCircle2 className="h-8 w-8 text-emerald-700" />
          <div>
            <p className="font-medium text-emerald-900">{user?.name ?? "Admin User"}</p>
            <p className="text-sm text-emerald-700">{user?.email}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-600">
          Access is controlled by server environment variables (`ADMIN_EMAILS` and approved-client email variants).
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-emerald-100 bg-white/85 p-6 shadow-sm backdrop-blur-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold text-emerald-900">Client account approvals</h2>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email, business, or location"
            className="md:max-w-sm"
          />
        </div>

        {loading ? (
          <p className="text-sm text-emerald-700">Loading clients...</p>
        ) : filteredClients.length === 0 ? (
          <p className="text-sm text-slate-600">No client accounts match your search.</p>
        ) : (
          <div className="space-y-3">
            {filteredClients.map((client) => {
              const isBusy = busyClientId === client.id
              return (
                <div
                  key={client.id}
                  className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-emerald-900">{client.name}</p>
                        {statusBadge(client.approvalStatus)}
                      </div>
                      <p className="text-sm text-slate-700">
                        {client.email} · {client.businessName}
                      </p>
                      <p className="text-xs text-slate-500">
                        Registered {new Date(client.registrationDate).toLocaleString()}
                        {client.loginRouteSentAt
                          ? ` · Login route sent ${new Date(client.loginRouteSentAt).toLocaleString()}`
                          : ""}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        disabled={isBusy || client.approvalStatus === "approved"}
                        onClick={() => void runClientAction(client.id, "approve")}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approve + Send Login
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isBusy}
                        onClick={() => void runClientAction(client.id, "send-login-route")}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Send Login Route
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={isBusy || client.approvalStatus === "rejected"}
                        onClick={() => void runClientAction(client.id, "reject")}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-emerald-100 bg-white/85 p-6 shadow-sm backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-emerald-900">Audit trail history</h2>
        <p className="mt-1 text-sm text-slate-600">Track who approved, rejected, or sent login routes and when.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <select
            value={auditActionFilter}
            onChange={(event) => setAuditActionFilter(event.target.value)}
            className="h-10 rounded-md border border-emerald-200 bg-white px-3 text-sm text-slate-700"
          >
            <option value="">All actions</option>
            {auditActions.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
          <select
            value={auditAdminFilter}
            onChange={(event) => setAuditAdminFilter(event.target.value)}
            className="h-10 rounded-md border border-emerald-200 bg-white px-3 text-sm text-slate-700"
          >
            <option value="">All admins</option>
            {auditAdmins.map((adminEmail) => (
              <option key={adminEmail} value={adminEmail}>
                {adminEmail}
              </option>
            ))}
          </select>
          <Input type="datetime-local" value={auditFrom} onChange={(event) => setAuditFrom(event.target.value)} />
          <Input type="datetime-local" value={auditTo} onChange={(event) => setAuditTo(event.target.value)} />
        </div>
        {loadingAudit ? (
          <p className="mt-4 text-sm text-emerald-700">Loading audit logs...</p>
        ) : auditLogs.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">No audit events yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-emerald-100 text-left text-emerald-800">
                  <th className="px-3 py-2 font-semibold">When</th>
                  <th className="px-3 py-2 font-semibold">Action</th>
                  <th className="px-3 py-2 font-semibold">Client</th>
                  <th className="px-3 py-2 font-semibold">Admin</th>
                  <th className="px-3 py-2 font-semibold">Note</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="border-b border-emerald-50 align-top">
                    <td className="px-3 py-2 text-slate-700">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-3 py-2 font-medium text-emerald-900">{log.action}</td>
                    <td className="px-3 py-2 text-slate-700">
                      <p>{log.clientName}</p>
                      <p className="text-xs text-slate-500">{log.clientEmail}</p>
                    </td>
                    <td className="px-3 py-2 text-slate-700">{log.adminEmail}</td>
                    <td className="px-3 py-2 text-slate-700">{log.note || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loadingAudit || auditPage <= 1}
            onClick={() => setAuditPage((prev) => Math.max(1, prev - 1))}
          >
            Previous
          </Button>
          <p className="text-sm text-slate-600">
            Page {auditPage} of {auditTotalPages}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loadingAudit || auditPage >= auditTotalPages}
            onClick={() => setAuditPage((prev) => Math.min(auditTotalPages, prev + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
