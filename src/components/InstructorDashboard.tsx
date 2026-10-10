import { Link } from "react-router-dom"
import { Users, Wallet, Star, TrendingUp, BarChart3, BookOpen } from "lucide-react"
import { useInstructorStats } from "@/hooks/queries"
import { EmptyState, ErrorState, PageShell, Spinner } from "@/components/ui"
import { formatEtb } from "@/lib/money"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export default function InstructorDashboard() {
  const { data, isLoading, isError, error, refetch } = useInstructorStats()

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
          <p className="text-gray-500 mt-1">Track your course performance</p>
        </div>
        <Link to="/" className="text-sm text-purple-600 hover:text-purple-700 font-medium">Back to Site</Link>
      </div>

      {isLoading ? <Spinner label="Loading analytics" /> : isError || !data ? <ErrorState message={error?.message} onRetry={() => refetch()} /> : (
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
            <h2 className="font-semibold text-gray-900 mb-4">Top Performing Courses</h2>
            {data.topCourses.length === 0 ? (
              <EmptyState icon={<BookOpen size={36} />} title="No sales yet." hint="Your best courses show up here once students enroll." />
            ) : (
              <ol className="space-y-3">
                {data.topCourses.map((tc, i) => (
                  <li key={tc.courseId} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                    <span className="text-lg font-bold text-purple-300">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <Link to={`/courses/${tc.courseId}`} className="font-medium text-gray-900 text-sm truncate block hover:text-purple-700">{tc.title}</Link>
                      <p className="text-xs text-gray-500">{tc.enrollments.toLocaleString()} enrollments</p>
                    </div>
                    <div className="text-right"><p className="font-semibold text-gray-900 text-sm">{formatEtb(tc.revenueEtb)}</p><p className="text-xs text-green-600">revenue</p></div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </>
      )}
    </PageShell>
  )
}

function Card({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 text-purple-600 mb-2">{icon}<span className="text-xs font-medium">{label}</span></div>
      <p className="text-2xl font-bold text-gray-900 break-words">{value}</p>
    </div>
  )
}

function Bars({ title, values, format, color }: { title: string; values: number[]; format: (v: number) => string; color: string }) {
  const max = Math.max(...values, 1)
  return (
    <section className="bg-white rounded-xl border border-gray-100 p-6">
      <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><BarChart3 size={16} className="text-purple-600" /> {title}</h2>
      <div className="flex items-end gap-1.5 h-40" role="img" aria-label={`${title}: ${values.map((v, i) => `${MONTHS[i]} ${format(v)}`).join(", ")}`}>
        {values.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1" title={`${MONTHS[i]}: ${format(v)}`}>
            <div className={`w-full rounded-t ${color}`} style={{ height: `${Math.round((v / max) * 100)}%`, minHeight: v > 0 ? 2 : 0 }} />
            <span className="text-[10px] text-gray-400">{MONTHS[i]}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
