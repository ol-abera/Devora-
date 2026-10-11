import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import {
  Users, BookOpen, Wallet, AlertTriangle, Check, X, Shield, Ban, UserCheck, FileText, Ticket,
} from "lucide-react"
import { adminApi } from "@/api"
import {
  useAdminAudit, useAdminCourses, useAdminOverview, useAdminPendingCourses,
  useAdminReports, useAdminTickets, useAdminTransactions, useAdminUsers, keys,
} from "@/hooks/queries"
import { EmptyState, ErrorState, PageShell, Spinner } from "@/components/ui"
import { formatDate, formatEtb } from "@/lib/money"

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "Users" },
  { id: "courses", label: "Courses" },
  { id: "transactions", label: "Transactions" },
  { id: "reports", label: "Reports" },
  { id: "tickets", label: "Tickets" },
  { id: "audit", label: "Audit" },
] as const
type TabId = (typeof TABS)[number]["id"]

export default function AdminDashboard() {
  const [params, setParams] = useSearchParams()
  const tab = (TABS.some(t => t.id === params.get("tab")) ? params.get("tab") : "overview") as TabId
  const setTab = (id: TabId) => setParams(id === "overview" ? {} : { tab: id })

  return (
    <PageShell>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-[#7C3AED] text-sm font-medium mb-1">
          <Shield size={16} /> Admin
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Platform administration</h1>
        <p className="text-slate-500 mt-1">Users, course approval, payments, and audit history</p>
      </div>

      <div className="flex gap-1 mb-6 overflow-x-auto border-b border-slate-100 pb-px">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap ${tab === t.id ? "text-[#5B21B6] border-b-2 border-[#7C3AED]" : "text-slate-500 hover:text-slate-800"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <Overview />}
      {tab === "users" && <UsersTab />}
      {tab === "courses" && <CoursesTab />}
      {tab === "transactions" && <TransactionsTab />}
      {tab === "reports" && <ReportsTab />}
      {tab === "tickets" && <TicketsTab />}
      {tab === "audit" && <AuditTab />}
    </PageShell>
  )
}

function Overview() {
  const { data, isLoading, isError, error, refetch } = useAdminOverview()
  if (isLoading) return <Spinner label="Loading overview" />
  if (isError || !data) return <ErrorState message={error?.message} onRetry={() => refetch()} />

  const cards = [
    { label: "Users", value: data.users, icon: <Users size={16} /> },
    { label: "Instructors", value: data.instructors, icon: <UserCheck size={16} /> },
    { label: "Published courses", value: data.courses, icon: <BookOpen size={16} /> },
    { label: "Pending approval", value: data.pendingCourses, icon: <AlertTriangle size={16} /> },
    { label: "Revenue (ETB)", value: formatEtb(data.revenueEtb), icon: <Wallet size={16} /> },
    { label: "Transactions", value: data.transactions, icon: <FileText size={16} /> },
    { label: "Open tickets", value: data.openTickets, icon: <Ticket size={16} /> },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {cards.map(c => (
        <div key={c.label} className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">{c.icon}{c.label}</div>
          <p className="text-xl font-bold text-slate-900">{c.value}</p>
        </div>
      ))}
    </div>
  )
}

function UsersTab() {
  const { data, isLoading, isError, error, refetch } = useAdminUsers()
  const qc = useQueryClient()
  const [search, setSearch] = useState("")

  const rows = useMemo(() => {
    const list = data ?? []
    const s = search.trim().toLowerCase()
    if (!s) return list
    return list.filter(u => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s))
  }, [data, search])

  const setStatus = async (id: string, status: "active" | "suspended") => {
    try {
      await adminApi.setUserStatus(id, status)
      toast.success(status === "suspended" ? "User suspended" : "User activated")
      qc.invalidateQueries({ queryKey: keys.adminUsers })
      qc.invalidateQueries({ queryKey: keys.adminAudit })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed")
    }
  }
  const setRole = async (id: string, role: "student" | "instructor") => {
    try {
      await adminApi.setUserRole(id, role)
      toast.success(`Role set to ${role}`)
      qc.invalidateQueries({ queryKey: keys.adminUsers })
      qc.invalidateQueries({ queryKey: keys.adminAudit })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed")
    }
  }

  if (isLoading) return <Spinner label="Loading users" />
  if (isError) return <ErrorState message={error.message} onRetry={() => refetch()} />

  return (
    <div className="space-y-4">
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search name or email…"
        className="w-full max-w-sm px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#7C3AED]"
      />
      <div className="bg-white rounded-2xl border border-slate-100 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase text-left">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.map(u => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{u.name}</p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </td>
                <td className="px-4 py-3 capitalize">{u.role}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.status === "active" ? "bg-emerald-50 text-emerald-700" : u.status === "suspended" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3">
                  {u.role !== "admin" && (
                    <div className="flex justify-end gap-1">
                      {u.status === "active" ? (
                        <button type="button" onClick={() => setStatus(u.id, "suspended")} className="p-2 rounded-lg hover:bg-red-50 text-red-600" title="Suspend"><Ban size={14} /></button>
                      ) : (
                        <button type="button" onClick={() => setStatus(u.id, "active")} className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600" title="Activate"><Check size={14} /></button>
                      )}
                      {u.role === "student" ? (
                        <button type="button" onClick={() => setRole(u.id, "instructor")} className="text-xs px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50">Make instructor</button>
                      ) : (
                        <button type="button" onClick={() => setRole(u.id, "student")} className="text-xs px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50">Make student</button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CoursesTab() {
  const pendingQ = useAdminPendingCourses()
  const allQ = useAdminCourses()
  const qc = useQueryClient()
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [reason, setReason] = useState("")

  const approve = async (id: string) => {
    try {
      await adminApi.approveCourse(id)
      toast.success("Course published")
      qc.invalidateQueries({ queryKey: ["admin"] })
      qc.invalidateQueries({ queryKey: keys.courses({}) })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed")
    }
  }
  const reject = async () => {
    if (!rejectId) return
    try {
      await adminApi.rejectCourse(rejectId, reason)
      toast.success("Course rejected")
      setRejectId(null)
      setReason("")
      qc.invalidateQueries({ queryKey: ["admin"] })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed")
    }
  }

  if (pendingQ.isLoading || allQ.isLoading) return <Spinner label="Loading courses" />
  if (pendingQ.isError) return <ErrorState message={pendingQ.error.message} onRetry={() => pendingQ.refetch()} />

  const pending = pendingQ.data ?? []
  const all = allQ.data ?? []

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-semibold text-slate-900 mb-3">Pending approval ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="text-sm text-slate-500">No courses waiting for review.</p>
        ) : (
          <ul className="space-y-3">
            {pending.map(c => (
              <li key={c.id} className="bg-white rounded-xl border border-slate-100 p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{c.title}</p>
                  <p className="text-xs text-slate-500">{c.instructorName} · {c.level} · {formatEtb(c.price)}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => approve(c.id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">
                    <Check size={14} /> Approve
                  </button>
                  <button type="button" onClick={() => { setRejectId(c.id); setReason("") }} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50">
                    <X size={14} /> Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-semibold text-slate-900 mb-2">Reject course</h3>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder="Reason shown to the instructor" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm mb-4" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setRejectId(null)} className="px-3 py-2 text-sm text-slate-600">Cancel</button>
              <button type="button" onClick={reject} className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium">Reject</button>
            </div>
          </div>
        </div>
      )}

      <section>
        <h2 className="font-semibold text-slate-900 mb-3">All instructor courses</h2>
        {all.length === 0 ? (
          <EmptyState title="No instructor-created courses yet" hint="When instructors submit courses they appear here." />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Course</th>
                  <th className="px-4 py-3 font-medium">Instructor</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {all.map(c => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{c.title}</td>
                    <td className="px-4 py-3 text-slate-600">{c.instructorName}</td>
                    <td className="px-4 py-3 text-xs capitalize">{c.status.replace("_", " ")}</td>
                    <td className="px-4 py-3">{formatEtb(c.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function TransactionsTab() {
  const { data, isLoading, isError, error, refetch } = useAdminTransactions()
  if (isLoading) return <Spinner label="Loading transactions" />
  if (isError) return <ErrorState message={error.message} onRetry={() => refetch()} />
  const rows = data ?? []
  if (!rows.length) return <EmptyState title="No transactions yet" hint="Chapa payments appear here after checkout." />

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-x-auto">
      <table className="w-full text-sm min-w-[700px]">
        <thead className="bg-slate-50 text-xs text-slate-500 uppercase text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Tx</th>
            <th className="px-4 py-3 font-medium">Course</th>
            <th className="px-4 py-3 font-medium">Buyer</th>
            <th className="px-4 py-3 font-medium">Amount</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Access</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map(r => (
            <tr key={r.txRef}>
              <td className="px-4 py-3 font-mono text-xs">{r.txRef}</td>
              <td className="px-4 py-3">{r.courseTitle}</td>
              <td className="px-4 py-3">
                <p>{r.buyerName}</p>
                <p className="text-xs text-slate-400">{r.email}</p>
              </td>
              <td className="px-4 py-3">{formatEtb(r.amountEtb)}</td>
              <td className="px-4 py-3 capitalize">{r.status}</td>
              <td className="px-4 py-3">{r.accessGranted ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ReportsTab() {
  const { data, isLoading, isError, error, refetch } = useAdminReports()
  const qc = useQueryClient()
  const resolve = async (id: string, status: "dismissed" | "actioned") => {
    try {
      await adminApi.resolveReport(id, status)
      toast.success(status === "actioned" ? "Marked actioned" : "Dismissed")
      qc.invalidateQueries({ queryKey: keys.adminReports })
      qc.invalidateQueries({ queryKey: keys.adminAudit })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed")
    }
  }
  if (isLoading) return <Spinner label="Loading reports" />
  if (isError) return <ErrorState message={error.message} onRetry={() => refetch()} />
  const rows = data ?? []

  return (
    <ul className="space-y-3">
      {rows.map(r => (
        <li key={r.id} className="bg-white rounded-xl border border-slate-100 p-4 flex flex-wrap justify-between gap-3">
          <div>
            <p className="text-xs text-slate-400 uppercase">{r.type} · {r.status}</p>
            <p className="text-sm text-slate-800 mt-1">{r.reason}</p>
            <p className="text-xs text-slate-400 mt-1">Target {r.targetId} · {formatDate(r.createdAt)}</p>
          </div>
          {r.status === "open" && (
            <div className="flex gap-2">
              <button type="button" onClick={() => resolve(r.id, "dismissed")} className="text-sm px-3 py-1.5 rounded-lg border border-slate-200">Dismiss</button>
              <button type="button" onClick={() => resolve(r.id, "actioned")} className="text-sm px-3 py-1.5 rounded-lg bg-[#7C3AED] text-white">Actioned</button>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

function TicketsTab() {
  const { data, isLoading, isError, error, refetch } = useAdminTickets()
  const qc = useQueryClient()
  const resolve = async (id: string) => {
    try {
      await adminApi.resolveTicket(id)
      toast.success("Ticket resolved")
      qc.invalidateQueries({ queryKey: keys.adminTickets })
      qc.invalidateQueries({ queryKey: keys.adminOverview })
      qc.invalidateQueries({ queryKey: keys.adminAudit })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed")
    }
  }
  if (isLoading) return <Spinner label="Loading tickets" />
  if (isError) return <ErrorState message={error.message} onRetry={() => refetch()} />
  const rows = data ?? []

  return (
    <ul className="space-y-3">
      {rows.map(t => (
        <li key={t.id} className="bg-white rounded-xl border border-slate-100 p-4 flex flex-wrap justify-between gap-3">
          <div>
            <p className="font-medium text-slate-900">{t.subject}</p>
            <p className="text-sm text-slate-600 mt-1">{t.message}</p>
            <p className="text-xs text-slate-400 mt-2">{t.email} · {t.status} · {formatDate(t.createdAt)}</p>
          </div>
          {t.status === "open" && (
            <button type="button" onClick={() => resolve(t.id)} className="text-sm px-3 py-1.5 rounded-lg bg-emerald-600 text-white h-fit">Resolve</button>
          )}
        </li>
      ))}
    </ul>
  )
}

function AuditTab() {
  const { data, isLoading, isError, error, refetch } = useAdminAudit()
  if (isLoading) return <Spinner label="Loading audit log" />
  if (isError) return <ErrorState message={error.message} onRetry={() => refetch()} />
  const rows = data ?? []
  if (!rows.length) return <EmptyState title="No admin actions yet" hint="Approvals, suspensions, and report resolutions are logged here." />

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <ul className="divide-y divide-slate-50">
        {rows.map(a => (
          <li key={a.id} className="px-4 py-3 text-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <p className="font-medium text-slate-900">{a.action}</p>
              <time className="text-xs text-slate-400">{formatDate(a.createdAt)}</time>
            </div>
            <p className="text-slate-600 mt-0.5">{a.detail}</p>
            <p className="text-xs text-slate-400 mt-1">{a.actorName} · {a.targetType}:{a.targetId}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
