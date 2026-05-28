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
  suspendedAt?: string | null
  suspendedReason?: string | null
  deletedAt?: string | null
  termsAcceptedAt?: string | null
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

  const runClientAction = async (
    clientId: string,
    action: "approve" | "reject" | "send-login-route" | "send-business-admin-credentials",
  ) => {
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
          ? `${data.message} Share user login: ${data.loginUrl}. Business admin email: ${data.ownerAdminEmail ?? "n/a"}, temp password: ${data.ownerAdminPassword ?? "n/a"}, login: ${data.ownerAdminLoginUrl ?? "n/a"}`
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

  const runComplianceAction = async (
    clientId: string,
    action: "suspend" | "unsuspend" | "delete",
    clientName: string,
  ) => {
    try {
      setBusyClientId(clientId)
      const needsReason = action === "suspend" || action === "delete"
      const reason = needsReason ? window.prompt(`Reason for ${action} (${clientName})?`, "Policy violation") : ""
      if (needsReason && reason === null) return

      const response = await fetch(`/api/admin/clients/${clientId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error || "Action failed")

      toast({ title: "Success", description: data?.message || "Action completed." })
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
    <div className="w-full py-2 sm:py-4">
      <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-white/40 bg-white/55 px-5 py-5 shadow-[0_10px_35px_-20px_rgba(16,185,129,0.35)] ring-1 ring-emerald-100/60 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Administration</h1>
          <p className="mt-1 text-sm text-slate-600">Manage client approvals, login access, and audit compliance.</p>
        </div>
        <div className="flex items-center justify-between sm:justify-end">
          <ShieldCheck className="h-7 w-7 text-emerald-600" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/40 bg-white/55 p-4 shadow-sm ring-1 ring-emerald-100/50 backdrop-blur-xl">
          <p className="text-sm text-slate-600">Total clients</p>
          <p className="text-2xl font-semibold text-slate-900">{counts.total}</p>
        </div>
        <div className="rounded-2xl border border-amber-200/60 bg-white/55 p-4 shadow-sm ring-1 ring-amber-100/50 backdrop-blur-xl">
          <p className="text-sm text-amber-700">Pending approvals</p>
          <p className="text-2xl font-semibold text-amber-900">{counts.pending}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200/60 bg-white/55 p-4 shadow-sm ring-1 ring-emerald-100/50 backdrop-blur-xl">
          <p className="text-sm text-emerald-700">Approved clients</p>
          <p className="text-2xl font-semibold text-emerald-900">{counts.approved}</p>
        </div>
        <div className="rounded-2xl border border-rose-200/60 bg-white/55 p-4 shadow-sm ring-1 ring-rose-100/50 backdrop-blur-xl">
          <p className="text-sm text-rose-700">Rejected</p>
          <p className="text-2xl font-semibold text-rose-900">{counts.rejected}</p>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-white/40 bg-white/55 p-5 shadow-sm ring-1 ring-emerald-100/60 backdrop-blur-xl sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Current session</h2>
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/40 bg-white/55 p-4 backdrop-blur-xl">
          <UserCircle2 className="h-8 w-8 text-emerald-700" />
          <div>
            <p className="font-medium text-slate-900">{user?.name ?? "Admin User"}</p>
            <p className="text-sm text-slate-600">{user?.email}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Access is controlled by server environment variables (`ADMIN_EMAILS` and approved-client email variants).
        </p>
      </div>

      <div className="mt-6 rounded-3xl border border-white/40 bg-white/55 p-5 shadow-sm ring-1 ring-emerald-100/60 backdrop-blur-xl sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Client account approvals</h2>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email, business, or location"
            className="border-slate-200 bg-white/70 backdrop-blur-xl sm:max-w-sm"
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
              const isSuspended = Boolean(client.suspendedAt)
              const isDeleted = Boolean(client.deletedAt)
              const needsTerms = client.approvalStatus === "approved" && !client.termsAcceptedAt
              return (
                <div
                  key={client.id}
                    className="rounded-2xl border border-white/40 bg-white/55 p-4 shadow-sm ring-1 ring-emerald-100/50 backdrop-blur-xl transition hover:bg-white/70 hover:shadow-md"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-emerald-900">{client.name}</p>
                        {statusBadge(client.approvalStatus)}
                        {isSuspended ? (
                          <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100">Suspended</Badge>
                        ) : null}
                        {isDeleted ? (
                          <Badge className="bg-slate-200 text-slate-800 hover:bg-slate-200">Deleted</Badge>
                        ) : null}
                        {needsTerms ? (
                          <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">Terms pending</Badge>
                        ) : null}
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
                      {isSuspended && client.suspendedReason ? (
                        <p className="mt-1 text-xs text-rose-700">Reason: {client.suspendedReason}</p>
                      ) : null}
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
                        variant="outline"
                        disabled={isBusy || client.approvalStatus !== "approved"}
                        onClick={() => void runClientAction(client.id, "send-business-admin-credentials")}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Resend Business Admin Login
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

                      {isSuspended ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isBusy}
                          onClick={() => void runComplianceAction(client.id, "unsuspend", client.name)}
                        >
                          Unsuspend
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isBusy || isDeleted}
                          onClick={() => void runComplianceAction(client.id, "suspend", client.name)}
                          className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-300"
                        >
                          Suspend
                        </Button>
                      )}

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isBusy || isDeleted}
                        onClick={() => void runComplianceAction(client.id, "delete", client.name)}
                        className="border-slate-300 text-slate-700 hover:bg-slate-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-3xl border border-white/40 bg-white/55 p-5 shadow-sm ring-1 ring-emerald-100/60 backdrop-blur-xl sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Audit trail history</h2>
        <p className="mt-1 text-sm text-slate-600">Track who approved, rejected, or sent login routes and when.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select
            value={auditActionFilter}
            onChange={(event) => setAuditActionFilter(event.target.value)}
            className="h-11 rounded-xl border border-white/40 bg-white/70 px-3 text-sm text-slate-700 backdrop-blur-xl"
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
            className="h-11 rounded-xl border border-white/40 bg-white/70 px-3 text-sm text-slate-700 backdrop-blur-xl"
          >
            <option value="">All admins</option>
            {auditAdmins.map((adminEmail) => (
              <option key={adminEmail} value={adminEmail}>
                {adminEmail}
              </option>
            ))}
          </select>
          <Input
            type="datetime-local"
            value={auditFrom}
            onChange={(event) => setAuditFrom(event.target.value)}
            className="h-11 border-white/40 bg-white/70 backdrop-blur-xl"
          />
          <Input
            type="datetime-local"
            value={auditTo}
            onChange={(event) => setAuditTo(event.target.value)}
            className="h-11 border-white/40 bg-white/70 backdrop-blur-xl"
          />
        </div>
        {loadingAudit ? (
          <p className="mt-4 text-sm text-emerald-700">Loading audit logs...</p>
        ) : auditLogs.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">No audit events yet.</p>
        ) : (
          <>
            {/* Mobile-friendly list */}
            <div className="mt-4 space-y-3 sm:hidden">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-2xl border border-white/40 bg-white/55 p-4 shadow-sm ring-1 ring-emerald-100/50 backdrop-blur-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 capitalize">{log.action}</p>
                      <p className="mt-0.5 text-xs text-slate-600">{new Date(log.createdAt).toLocaleString()}</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Audit</Badge>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-slate-700">
                    <p className="font-medium text-emerald-900">{log.clientName}</p>
                    <p className="text-xs text-slate-600">{log.clientEmail}</p>
                    <p className="text-xs text-slate-600">Admin: {log.adminEmail}</p>
                    {log.note ? <p className="text-xs text-slate-700">Note: {log.note}</p> : null}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-white/40 bg-white/55 ring-1 ring-emerald-100/50 backdrop-blur-xl sm:block">
              <table className="min-w-full border-collapse text-sm">
                <thead className="sticky top-0">
                  <tr className="border-b border-white/40 bg-white/70 text-left text-slate-700 backdrop-blur-xl">
                    <th className="px-3 py-3 font-semibold">When</th>
                    <th className="px-3 py-3 font-semibold">Action</th>
                    <th className="px-3 py-3 font-semibold">Client</th>
                    <th className="px-3 py-3 font-semibold">Admin</th>
                    <th className="px-3 py-3 font-semibold">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log, index) => (
                    <tr key={log.id} className={`align-top ${index % 2 === 0 ? "bg-white/30" : "bg-white/55"}`}>
                      <td className="px-3 py-3 text-slate-700 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="px-3 py-3 font-medium capitalize text-slate-900 whitespace-nowrap">{log.action}</td>
                      <td className="px-3 py-3 text-slate-700">
                        <p className="font-medium text-slate-900">{log.clientName}</p>
                        <p className="text-xs text-slate-600">{log.clientEmail}</p>
                      </td>
                      <td className="px-3 py-3 text-slate-700 whitespace-nowrap">{log.adminEmail}</td>
                      <td className="px-3 py-3 text-slate-700">{log.note || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
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
