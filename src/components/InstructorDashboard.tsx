import { Link, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { Users, Wallet, Star, TrendingUp, BookOpen, Plus, Pencil, Send, EyeOff } from "lucide-react"
import { instructorApi, type CourseStatus } from "@/api"
import { useInstructorCourses, useInstructorRevenue, useInstructorStats, useInstructorStudents, keys } from "@/hooks/queries"
import { EmptyState, ErrorState, PageShell, Spinner } from "@/components/ui"
import { formatEtb, formatDate } from "@/lib/money"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const TABS = [
  { id: "overview", label: "Overview" },
  { id: "courses", label: "Courses" },
  { id: "students", label: "Students" },
  { id: "revenue", label: "Revenue" },
] as const

type TabId = (typeof TABS)[number]["id"]

const statusStyle: Record<CourseStatus, string> = {
  draft: "bg-slate-100 text-slate-600",
  pending_review: "bg-amber-50 text-amber-700",
  published: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
  archived: "bg-slate-100 text-slate-500",
}

export default function InstructorDashboard() {
  const [params, setParams] = useSearchParams()
  const tab = (TABS.some(t => t.id === params.get("tab")) ? params.get("tab") : "overview") as TabId
  const setTab = (id: TabId) => setParams(id === "overview" ? {} : { tab: id })

  return (
    <PageShell>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Instructor Hub</h1>
          <p className="text-slate-500 mt-1">Courses, students, and earnings</p>
        </div>
        <Link to="/instructor/courses/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7C3AED] text-white text-sm font-medium hover:bg-[#6D28D9]">
          <Plus size={16} /> New course
        </Link>
      </div>

      <div className="flex gap-1 mb-6 overflow-x-auto border-b border-slate-100 pb-px">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap ${tab === t.id ? "text-[#5B21B6] border-b-2 border-[#7C3AED]" : "text-slate-500 hover:text-slate-800"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab />}
      {tab === "courses" && <CoursesTab />}
      {tab === "students" && <StudentsTab />}
      {tab === "revenue" && <RevenueTab />}
    </PageShell>
  )
}

function OverviewTab() {
  const { data, isLoading, isError, error, refetch } = useInstructorStats()
  if (isLoading) return <Spinner label="Loading analytics" />
  if (isError || !data) return <ErrorState message={error?.message} onRetry={() => refetch()} />

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card icon={<Wallet size={16} />} label="Revenue" value={formatEtb(data.totalRevenueEtb)} />
        <Card icon={<Users size={16} />} label="Active students" value={data.activeStudents.toLocaleString()} />
        <Card icon={<Star size={16} />} label="Avg rating" value={data.avgRating.toFixed(1)} />
        <Card icon={<TrendingUp size={16} />} label="Monthly growth" value={`${data.monthlyGrowthPct >= 0 ? "+" : ""}${data.monthlyGrowthPct}%`} />
      </div>
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Bars title="Revenue by month" values={data.revenueByMonth} format={v => formatEtb(v)} color="bg-purple-500" />
        <Bars title="Enrollments by month" values={data.enrollmentByMonth} format={v => String(v)} color="bg-cyan-500" />
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Top performing courses</h2>
        {data.topCourses.length === 0 ? (
          <EmptyState icon={<BookOpen size={36} />} title="No sales yet." hint="Your best courses show up here once students enroll." />
        ) : (
          <ol className="space-y-3">
            {data.topCourses.map((tc, i) => (
              <li key={tc.courseId} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-7 h-7 rounded-lg bg-[#EDE9FE] text-[#5B21B6] text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{tc.title}</p>
                    <p className="text-xs text-gray-500">{tc.enrollments.toLocaleString()} enrollments</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-800 shrink-0">{formatEtb(tc.revenueEtb)}</p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  )
}

function CoursesTab() {
  const { data, isLoading, isError, error, refetch } = useInstructorCourses()
  const qc = useQueryClient()

  const act = async (id: string, action: "submit" | "unpublish") => {
    try {
      if (action === "submit") await instructorApi.submitCourse(id)
      else await instructorApi.unpublishCourse(id)
      toast.success(action === "submit" ? "Submitted for review" : "Moved to draft")
      qc.invalidateQueries({ queryKey: keys.instructorCourses })
      qc.invalidateQueries({ queryKey: keys.courses({}) })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed")
    }
  }

  if (isLoading) return <Spinner label="Loading courses" />
  if (isError) return <ErrorState message={error.message} onRetry={() => refetch()} />
  const courses = data ?? []

  if (!courses.length) {
    return (
      <EmptyState
        icon={<BookOpen size={40} />}
        title="No courses yet"
        hint="Create your first course with modules, lessons, and ETB pricing."
        action={<Link to="/instructor/courses/new" className="text-sm font-medium text-[#7C3AED]">Create course</Link>}
      />
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs text-slate-500 uppercase tracking-wide">
          <tr>
            <th className="px-4 py-3 font-medium">Course</th>
            <th className="px-4 py-3 font-medium hidden sm:table-cell">Status</th>
            <th className="px-4 py-3 font-medium hidden md:table-cell">Price</th>
            <th className="px-4 py-3 font-medium hidden lg:table-cell">Updated</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {courses.map(c => (
            <tr key={c.id} className="hover:bg-slate-50/50">
              <td className="px-4 py-3">
                <p className="font-medium text-slate-900">{c.title}</p>
                <p className="text-xs text-slate-400">{c.level} · {c.lessons} lessons</p>
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyle[c.status]}`}>{c.status.replace("_", " ")}</span>
              </td>
              <td className="px-4 py-3 hidden md:table-cell">{formatEtb(c.price)}</td>
              <td className="px-4 py-3 hidden lg:table-cell text-slate-500">{formatDate(c.lastUpdated)}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <Link to={`/instructor/courses/${c.id}/edit`} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600" title="Edit"><Pencil size={14} /></Link>
                  {(c.status === "draft" || c.status === "rejected") && (
                    <button type="button" onClick={() => act(c.id, "submit")} className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600" title="Submit for review"><Send size={14} /></button>
                  )}
                  {(c.status === "published" || c.status === "pending_review") && (
                    <button type="button" onClick={() => act(c.id, "unpublish")} className="p-2 rounded-lg hover:bg-amber-50 text-amber-700" title="Unpublish"><EyeOff size={14} /></button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StudentsTab() {
  const { data, isLoading, isError, error, refetch } = useInstructorStudents()
  if (isLoading) return <Spinner label="Loading students" />
  if (isError) return <ErrorState message={error.message} onRetry={() => refetch()} />
  const rows = data ?? []
  if (!rows.length) return <EmptyState icon={<Users size={40} />} title="No students yet" hint="Students who enroll in your published courses appear here." />

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs text-slate-500 uppercase tracking-wide">
          <tr>
            <th className="px-4 py-3 font-medium">Student</th>
            <th className="px-4 py-3 font-medium">Course</th>
            <th className="px-4 py-3 font-medium hidden sm:table-cell">Enrolled</th>
            <th className="px-4 py-3 font-medium">Progress</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map(r => (
            <tr key={`${r.userId}-${r.courseId}`}>
              <td className="px-4 py-3">
                <p className="font-medium text-slate-900">{r.name}</p>
                <p className="text-xs text-slate-400">{r.email}</p>
              </td>
              <td className="px-4 py-3 text-slate-700">{r.courseTitle}</td>
              <td className="px-4 py-3 hidden sm:table-cell text-slate-500">{formatDate(r.enrolledAt)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 max-w-[80px] rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-[#7C3AED]" style={{ width: `${r.progress}%` }} />
                  </div>
                  <span className="text-xs text-slate-500">{r.progress}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RevenueTab() {
  const { data, isLoading, isError, error, refetch } = useInstructorRevenue()
  if (isLoading) return <Spinner label="Loading revenue" />
  if (isError) return <ErrorState message={error.message} onRetry={() => refetch()} />
  const rows = data ?? []
  if (!rows.length) return <EmptyState icon={<Wallet size={40} />} title="No payments yet" hint="Successful paid enrollments on your courses show up here." />

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs text-slate-500 uppercase tracking-wide">
          <tr>
            <th className="px-4 py-3 font-medium">Transaction</th>
            <th className="px-4 py-3 font-medium">Course</th>
            <th className="px-4 py-3 font-medium">Amount</th>
            <th className="px-4 py-3 font-medium hidden sm:table-cell">Paid</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map(r => (
            <tr key={r.txRef}>
              <td className="px-4 py-3 font-mono text-xs text-slate-600">{r.txRef}</td>
              <td className="px-4 py-3">{r.courseTitle}</td>
              <td className="px-4 py-3 font-medium">{formatEtb(r.amountEtb)}</td>
              <td className="px-4 py-3 hidden sm:table-cell text-slate-500">{formatDate(r.paidAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Card({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-2">{icon}{label}</div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function Bars({ title, values, format, color }: { title: string; values: number[]; format: (v: number) => string; color: string }) {
  const max = Math.max(...values, 1)
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h2 className="font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="flex items-end gap-1.5 h-32">
        {values.map((v, i) => (
          <div key={MONTHS[i]} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <div className={`w-full rounded-t ${color} opacity-80`} style={{ height: `${(v / max) * 100}%`, minHeight: v ? 4 : 0 }} title={format(v)} />
            <span className="text-[10px] text-gray-400">{MONTHS[i]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
