import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { Play, BookOpen, Award, TrendingUp, Target, Bookmark, Receipt, Settings, RefreshCw, Sparkles, ChevronRight } from "lucide-react"
import { useApp } from "@/hooks/useApp"
import { useCertificates, useCourses, useEnrollments, usePayments, useUpdateProfile } from "@/hooks/queries"
import { formatDate, formatEtb } from "@/lib/money"
import { EmptyState, ErrorState, PageShell, SkeletonCards } from "@/components/ui"

type Tab = "all" | "progress" | "completed"

export default function StudentDashboard() {
  const { user, enrollments, bookmarks, navigate, startLesson, selectCourse } = useApp()
  const certificatesQ = useCertificates()
  const paymentsQ = usePayments()
  const catalogQ = useCourses({ sort: "popular", limit: 12 })
  const updateProfile = useUpdateProfile()
  const [tab, setTab] = useState<Tab>("all")
  const [goalDraft, setGoalDraft] = useState(String(user?.weeklyGoal ?? 5))

  const { data: enrollmentsData, isLoading, isError, error, refetch } = useEnrollments()
  const certificates = certificatesQ.data ?? []
  const payments = paymentsQ.data ?? []

  const inProgress = enrollments.filter(e => e.progress < 100)
  const completed = enrollments.filter(e => e.progress >= 100)
  const visible = tab === "progress" ? inProgress : tab === "completed" ? completed : enrollments
  const focus = inProgress[0]
  const goal = user?.weeklyGoal ?? 5
  const done = user?.lessonsThisWeek ?? 0
  const recommendations = (catalogQ.data?.items ?? []).filter(c => !enrollments.some(e => e.courseId === c.id)).slice(0, 3)

  const activity = useMemo(() => [
    ...enrollments.map(e => ({ id: `enroll-${e.courseId}`, title: `Enrolled in ${e.course.title}`, detail: e.source === "free" ? "Free course" : "Paid course", when: e.enrolledAt })),
    ...payments.filter(p => p.status !== "success").map(p => ({ id: p.txRef, title: `Payment ${p.status}`, detail: `${p.courseTitle} · ${formatEtb(p.amountEtb)}`, when: p.createdAt })),
    ...certificates.map(c => ({ id: c.id, title: "Certificate issued", detail: c.courseTitle, when: c.issuedAt })),
  ].sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime()).slice(0, 6), [enrollments, payments, certificates])

  const saveGoal = () => {
    const next = Math.min(30, Math.max(1, Math.round(Number(goalDraft)) || 1))
    setGoalDraft(String(next))
    updateProfile.mutate({ weeklyGoal: next }, { onSuccess: () => toast.success("Weekly goal saved"), onError: err => toast.error(err.message) })
  }

  return (
    <PageShell>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name}</h1>
          <p className="text-slate-500 mt-1">Continue your learning journey</p>
        </div>
        <button onClick={() => refetch()} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5B21B6] px-3 py-2 rounded-lg hover:bg-[#EDE9FE]">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {isLoading && <SkeletonCards count={3} />}
      {isError && <ErrorState message={error instanceof Error ? error.message : undefined} onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <Stat icon={<BookOpen size={16} />} label="Enrolled" value={String(enrollmentsData?.length ?? 0)} />
            <Stat icon={<Target size={16} />} label="In progress" value={String(inProgress.length)} />
            <Stat icon={<Award size={16} />} label="Completed" value={String(completed.length)} />
            <Stat icon={<TrendingUp size={16} />} label="Lessons this week" value={String(done)} />
          </div>

          <div className="grid lg:grid-cols-3 gap-4 mb-6">
            <section className="lg:col-span-2">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Continue Learning</h2>
              {focus ? (
                <div className="bg-gradient-to-r from-[#4C1D95] to-[#7C3AED] rounded-2xl p-5 text-white flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/70">{focus.course.category} · {focus.progress}%</p>
                    <h3 className="font-semibold truncate">{focus.course.title}</h3>
                    {focus.nextLesson && <p className="text-sm text-white/80 mt-1">Next: {focus.nextLesson.title}</p>}
                  </div>
                  <button onClick={() => startLesson(focus.courseId, focus.nextLesson?.id)} className="inline-flex items-center justify-center gap-1.5 bg-white text-[#5B21B6] px-4 py-2.5 rounded-xl text-sm font-semibold">
                    <Play size={14} /> Continue Learning
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100">
                  <EmptyState title="Nothing in progress" hint="Start a free course or buy one to continue." action={<Link to="/courses" className="text-sm font-medium text-[#7C3AED]">Browse courses</Link>} />
                </div>
              )}
            </section>

            <section className="bg-white rounded-2xl border border-slate-100 p-5">
              <h2 className="font-semibold text-slate-900">Learning goal</h2>
              <p className="text-sm text-slate-500 mt-1">Finish {goal} lessons this week.</p>
              <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.min(done, goal)} aria-valuemin={0} aria-valuemax={goal} aria-label="Weekly goal progress">
                <div className="h-full bg-[#7C3AED]" style={{ width: `${Math.min(100, Math.round((done / goal) * 100))}%` }} />
              </div>
              <p className="text-xs text-[#5B21B6] mt-2">{Math.min(done, goal)} / {goal} lessons</p>
              <div className="mt-4 flex gap-2">
                <input type="number" min={1} max={30} value={goalDraft} onChange={e => setGoalDraft(e.target.value)} className="w-20 px-3 py-2 rounded-lg border border-slate-200 text-sm" aria-label="Weekly lesson goal" />
                <button onClick={saveGoal} disabled={updateProfile.isPending} className="px-3 py-2 rounded-lg bg-[#7C3AED] text-white text-sm font-medium disabled:opacity-60">{updateProfile.isPending ? "Saving…" : "Save goal"}</button>
              </div>
            </section>
          </div>

          <section className="mb-6">
            <div className="flex flex-wrap gap-2 mb-3" role="tablist" aria-label="Filter my courses">
              {([["all", "All"], ["progress", "In Progress"], ["completed", "Completed"]] as const).map(([id, label]) => (
                <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold ${tab === id ? "bg-[#7C3AED] text-white" : "bg-white text-slate-600 border border-slate-200"}`}>{label}</button>
              ))}
            </div>
            {visible.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100">
                <EmptyState icon={<BookOpen size={40} />} title={tab === "completed" ? "No completed courses yet." : tab === "progress" ? "No courses in progress." : "You have not enrolled in a course yet."}
                  action={<Link to="/courses" className="px-4 py-2 rounded-lg bg-[#7C3AED] text-white text-sm font-medium">Browse courses</Link>} />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {visible.map(e => (
                  <article key={e.courseId} className="bg-white rounded-2xl border border-slate-100 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-[#7C3AED] font-medium">{e.course.level}</p>
                        <h3 className="font-semibold text-slate-900 truncate">{e.course.title}</h3>
                        <p className="text-xs text-slate-500 mt-1">{e.nextLesson ? `Next: ${e.nextLesson.title}` : "All lessons complete"}</p>
                      </div>
                      {e.progress >= 100 && <Award size={18} className="text-emerald-600 shrink-0" aria-label="Completed" />}
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#7C3AED]" style={{ width: `${e.progress}%` }} /></div>
                      <span className="text-xs font-medium text-[#5B21B6]">{e.progress}%</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => startLesson(e.courseId, e.nextLesson?.id)} className="text-sm font-medium text-white bg-[#7C3AED] px-3 py-1.5 rounded-lg">{e.progress >= 100 ? "Review" : "Resume"}</button>
                      <button onClick={() => selectCourse(e.course)} className="text-sm font-medium text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200">Details</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <div className="grid lg:grid-cols-2 gap-4 mb-6">
            <section className="bg-white rounded-2xl border border-slate-100 p-5">
              <h2 className="font-semibold text-slate-900 mb-3">Recent activity</h2>
              {activity.length === 0 ? <p className="text-sm text-slate-500">No enrollments, payments, or certificates yet.</p> : (
                <ul className="space-y-3">
                  {activity.map(item => (
                    <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
                      <div><p className="font-medium text-slate-800">{item.title}</p><p className="text-xs text-slate-500">{item.detail}</p></div>
                      <time dateTime={item.when} className="text-[11px] text-slate-400 shrink-0">{formatDate(item.when)}</time>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="bg-white rounded-2xl border border-slate-100 p-5">
              <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-1.5"><Sparkles size={16} className="text-[#7C3AED]" /> Recommended</h2>
              {catalogQ.isLoading ? <p className="text-sm text-slate-400">Loading…</p> : recommendations.length === 0 ? (
                <p className="text-sm text-slate-500">You are enrolled in every course we have.</p>
              ) : (
                <ul className="space-y-3">
                  {recommendations.map(c => (
                    <li key={c.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0"><p className="text-sm font-medium text-slate-900 truncate">{c.title}</p><p className="text-xs text-slate-500">{c.level} · {formatEtb(c.price)}</p></div>
                      <button onClick={() => selectCourse(c)} className="text-xs font-semibold text-[#7C3AED] shrink-0 inline-flex items-center gap-0.5">View <ChevronRight size={14} /></button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <QuickLink icon={<Bookmark size={16} />} label="Bookmarks" detail={`${bookmarks.length} saved`} onClick={() => navigate("bookmarks")} />
            <QuickLink icon={<Receipt size={16} />} label="My Purchases" detail={`${payments.length} payments`} onClick={() => navigate("purchases")} />
            <QuickLink icon={<Award size={16} />} label="Certificates" detail={`${certificates.length} earned`} onClick={() => navigate("certificates")} />
            <QuickLink icon={<Settings size={16} />} label="Settings" detail="Profile & goal" onClick={() => navigate("settings")} />
          </section>
        </>
      )}
    </PageShell>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-purple-100">
      <div className="flex items-center gap-2 text-[#7C3AED] mb-1">{icon}<span className="text-xs font-medium">{label}</span></div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  )
}

function QuickLink({ icon, label, detail, onClick }: { icon: React.ReactNode; label: string; detail: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="bg-white rounded-xl border border-slate-100 p-4 text-left hover:border-[#7C3AED]/40">
      <span className="text-[#7C3AED]">{icon}</span>
      <p className="mt-2 text-sm font-semibold text-slate-900">{label}</p>
      <p className="text-xs text-slate-500">{detail}</p>
    </button>
  )
}
