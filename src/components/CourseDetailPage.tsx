import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronRight, Star, Users, Clock, BookOpen, Play, FileText, Award, Globe, ShieldCheck, Bookmark, BookmarkCheck, Check } from "lucide-react"
import { coursesApi } from "@/api"
import { useApp } from "@/hooks/useApp"
import { useCourse, useReviews, keys } from "@/hooks/queries"
import { formatDate, formatEtb, isFreeCourse } from "@/lib/money"
import { ErrorState, PageShell, Spinner } from "@/components/ui"

const lessonIcons: Record<string, React.ReactNode> = {
  video: <Play size={14} />, quiz: <FileText size={14} />, project: <Award size={14} />, reading: <BookOpen size={14} />,
}

export function CourseDetailPage() {
  const { courseId } = useParams()
  const { toggleBookmark, isBookmarked, isEnrolled, beginCheckout, enrollFree, enrollingFree, continueLearning, user } = useApp()
  const [expandedModules, setExpandedModules] = useState<string[]>([])
  const courseQ = useCourse(courseId)
  const reviewsQ = useReviews(courseId)

  if (courseQ.isLoading) return <PageShell><Spinner label="Loading course" /></PageShell>
  const course = courseQ.data
  if (courseQ.isError || !course) {
    return (
      <PageShell narrow>
        <ErrorState message={courseQ.error?.message ?? "Course not found."} onRetry={() => courseQ.refetch()} />
        <Link to="/courses" className="block text-center text-[#7C3AED] font-medium text-sm">← Back to courses</Link>
      </PageShell>
    )
  }
  const openModules = expandedModules.length ? expandedModules : course.curriculum.slice(0, 1).map(m => m.id)

  const toggleModule = (id: string) => {
    setExpandedModules(openModules.includes(id) ? openModules.filter(m => m !== id) : [...openModules, id])
  }

  const totalLessons = course.curriculum.reduce((acc, m) => acc + m.lessons.length, 0)

  return (
    <main className="pt-16 min-h-screen bg-[#F8F7FC]">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#4C1D95] via-[#7C3AED] to-[#5B21B6] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link to="/" className="hover:text-white">Home</Link>
            <ChevronRight size={12} />
            <Link to="/courses" className="hover:text-white">Courses</Link>
            <ChevronRight size={12} />
            <span className="text-white/90">{course.category}</span>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight">{course.title}</h1>
              <p className="mt-3 text-lg text-white/80">{course.subtitle}</p>
              <div className="flex flex-wrap items-center gap-4 mt-5 text-sm text-white/70">
                <span className="flex items-center gap-1"><Star size={14} className="text-amber-300 fill-amber-300" /> {course.rating} ({course.reviews} reviews)</span>
                <span className="flex items-center gap-1"><Users size={14} /> {course.students.toLocaleString()} students</span>
                <span className="flex items-center gap-1"><Clock size={14} /> {course.duration}</span>
                <span className="flex items-center gap-1"><Globe size={14} /> {course.language}</span>
              </div>
              <div className="flex items-center gap-3 mt-5">
                <span className="text-sm text-white/60">Created by</span>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">{course.instructor.avatar}</div>
                  <span className="text-sm font-medium">{course.instructor.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* What You'll Learn */}
            <section className="bg-white rounded-2xl p-6 border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4">What you&apos;ll learn</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {course.whatYouLearn.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" /> {item}
                  </div>
                ))}
              </div>
            </section>

            {/* Curriculum */}
            <section className="bg-white rounded-2xl p-6 border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Curriculum</h2>
                <span className="text-xs text-slate-400">{course.curriculum.length} modules · {totalLessons} lessons</span>
              </div>
              <div className="space-y-3">
                {course.curriculum.map((mod) => {
                  const isOpen = openModules.includes(mod.id)
                  return (
                    <div key={mod.id} className="rounded-xl border border-slate-100 overflow-hidden">
                      <button onClick={() => toggleModule(mod.id)} aria-expanded={isOpen} className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left cursor-pointer">
                        <div className="flex items-center gap-3">
                          <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? "rotate-0" : "-rotate-90"}`} />
                          <span className="text-sm font-medium text-slate-900">{mod.title}</span>
                        </div>
                        <span className="text-xs text-slate-400">{mod.lessons.length} lessons</span>
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 py-2 space-y-1">
                              {mod.lessons.map(lesson => (
                                <div key={lesson.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors">
                                  <div className="flex items-center gap-3">
                                    <span className="text-[#7C3AED]">{lessonIcons[lesson.type]}</span>
                                    <span className="text-sm text-slate-700">{lesson.title}</span>
                                    {lesson.preview && <Link to={`/learn/${course.id}/${lesson.id}`} className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 font-medium hover:bg-emerald-100">Preview</Link>}
                                  </div>
                                  <span className="text-xs text-slate-400 font-mono">{lesson.duration}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Prerequisites */}
            <section className="bg-white rounded-2xl p-6 border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Prerequisites</h2>
              <ul className="space-y-2">
                {course.prerequisites.map((p, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" /> {p}
                  </li>
                ))}
              </ul>
            </section>

            {/* Reviews */}
            <section className="bg-white rounded-2xl p-6 border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Student reviews</h2>
              {reviewsQ.isLoading ? <Spinner label="Loading reviews" /> : reviewsQ.isError ? (
                <ErrorState message={reviewsQ.error.message} onRetry={() => reviewsQ.refetch()} />
              ) : (reviewsQ.data?.items.length ?? 0) === 0 ? (
                <p className="text-sm text-slate-500">No reviews yet. Be the first after you enroll.</p>
              ) : (
                <ul className="space-y-4">
                  {reviewsQ.data!.items.map(r => (
                    <li key={r.id} className="flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#EDE9FE] text-[#5B21B6] text-xs font-bold flex items-center justify-center shrink-0">{r.avatar}</div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{r.author} <span className="text-xs text-slate-400 font-normal">· {formatDate(r.createdAt)}</span></p>
                        <p className="flex items-center gap-0.5 mt-0.5" aria-label={`${r.rating} out of 5 stars`}>{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} className={i < r.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"} />)}</p>
                        {r.comment && <p className="text-sm text-slate-600 mt-1">{r.comment}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {user && isEnrolled(course.id) && <ReviewForm courseId={course.id} />}
            </section>

            {/* Instructor */}
            <section className="bg-white rounded-2xl p-6 border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Your Instructor</h2>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center text-white text-lg font-bold shrink-0">
                  {course.instructor.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{course.instructor.name}</h3>
                  <p className="text-sm text-[#7C3AED]">{course.instructor.title}</p>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">{course.instructor.bio}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Star size={12} className="text-amber-400 fill-amber-400" /> {course.instructor.rating} rating</span>
                    <span className="flex items-center gap-1"><Users size={12} /> {course.instructor.students.toLocaleString()} students</span>
                    <span className="flex items-center gap-1"><BookOpen size={12} /> {course.instructor.courses} courses</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Sticky Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-100 overflow-hidden">
              <div className="h-44 bg-gradient-to-br from-[#7C3AED] to-[#4C1D95] flex items-center justify-center relative">
                <Play size={40} className="text-white/40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play size={20} className="text-white ml-1" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold text-slate-900">{formatEtb(course.price)}</span>
                  {!isFreeCourse(course.price) && course.originalPrice > course.price && (
                    <>
                      <span className="text-sm text-slate-400 line-through">{formatEtb(course.originalPrice)}</span>
                      <span className="ml-auto text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{Math.round((1 - course.price / course.originalPrice) * 100)}% off</span>
                    </>
                  )}
                </div>
                {isEnrolled(course.id) ? (
                  <button
                    onClick={() => continueLearning(course)}
                    className="w-full py-3 rounded-xl bg-[#7C3AED] text-white font-semibold hover:bg-[#6D28D9] transition-colors shadow-lg shadow-[#7C3AED]/20 cursor-pointer"
                  >
                    Continue Learning
                  </button>
                ) : isFreeCourse(course.price) ? (
                  <button
                    onClick={() => enrollFree(course)} disabled={enrollingFree}
                    className="w-full py-3 rounded-xl bg-[#7C3AED] text-white font-semibold hover:bg-[#6D28D9] transition-colors shadow-lg shadow-[#7C3AED]/20 cursor-pointer"
                  >
                    {enrollingFree ? "Enrolling…" : "Enroll free"}
                  </button>
                ) : (
                  <button
                    onClick={() => beginCheckout(course)}
                    className="w-full py-3 rounded-xl bg-[#7C3AED] text-white font-semibold hover:bg-[#6D28D9] transition-colors shadow-lg shadow-[#7C3AED]/20 cursor-pointer"
                  >
                    Buy Course
                  </button>
                )}
                <button
                  onClick={() => toggleBookmark(course.id)}
                  aria-pressed={isBookmarked(course.id)}
                  className="w-full mt-3 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isBookmarked(course.id) ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                  {isBookmarked(course.id) ? "Bookmarked" : "Save for Later"}
                </button>
                <div className="mt-5 pt-5 border-t border-slate-100 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between"><span>Duration</span><span className="font-medium">{course.duration}</span></div>
                  <div className="flex items-center justify-between"><span>Lessons</span><span className="font-medium">{totalLessons}</span></div>
                  <div className="flex items-center justify-between"><span>Level</span><span className="font-medium">{course.level}</span></div>
                  <div className="flex items-center justify-between"><span>Certificate</span><span className="font-medium text-emerald-600">Yes</span></div>
                  <div className="flex items-center justify-between"><span>Last updated</span><span className="font-medium">{formatDate(course.lastUpdated)}</span></div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck size={14} className="text-emerald-500" /> Access unlocks after your payment is verified
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}


function ReviewForm({ courseId }: { courseId: string }) {
  const qc = useQueryClient()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [busy, setBusy] = useState(false)
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rating) return toast.error("Choose a star rating first")
    setBusy(true)
    try {
      await coursesApi.addReview(courseId, { rating, comment: comment.trim() })
      toast.success("Thanks for your review")
      setRating(0); setComment("")
      qc.invalidateQueries({ queryKey: keys.reviews(courseId) })
    } catch (err) { toast.error(err instanceof Error ? err.message : "Could not save your review") }
    finally { setBusy(false) }
  }
  return (
    <form onSubmit={submit} className="mt-6 pt-6 border-t border-slate-100 space-y-3">
      <p className="text-sm font-medium text-slate-900">Leave a review</p>
      <div className="flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => setRating(n)}>
            <Star size={22} className={n <= rating ? "text-amber-400 fill-amber-400" : "text-slate-300"} />
          </button>
        ))}
      </div>
      <textarea value={comment} onChange={e => setComment(e.target.value)} maxLength={1000} rows={3} aria-label="Review comment" placeholder="What did you think?" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#7C3AED]" />
      <button disabled={busy} className="px-4 py-2 rounded-lg bg-[#7C3AED] text-white text-sm font-medium disabled:opacity-60">{busy ? "Sending…" : "Post review"}</button>
    </form>
  )
}
