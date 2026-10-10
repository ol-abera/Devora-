import { useEffect, useState } from "react"
import { Link, Navigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { ChevronLeft, CheckCircle2, Play, BookOpen, FileText, Lightbulb, Brain, ArrowRight, Lock } from "lucide-react"
import { coursesApi, ApiError } from "@/api"
import type { QuizResult } from "@/api"
import { useApp } from "@/hooks/useApp"
import { useCompleteLesson, useCourse, useEnrollments, useLesson } from "@/hooks/queries"
import { ErrorState, PageShell, Spinner } from "@/components/ui"
import { AITutorChat } from "./AITutorChat"

export default function CourseLearningPage() {
  const { courseId, lessonId } = useParams()
  const { startLesson, navigate, selectCourse } = useApp()
  const courseQ = useCourse(courseId)
  const enrollmentsQ = useEnrollments()
  const lessonQ = useLesson(courseId, lessonId)
  const complete = useCompleteLesson()

  const [answers, setAnswers] = useState<number[]>([])
  const [result, setResult] = useState<QuizResult | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // New lesson = fresh quiz
  useEffect(() => { setAnswers([]); setResult(null) }, [lessonId])

  const course = courseQ.data
  const enrollment = enrollmentsQ.data?.find(e => e.courseId === courseId)

  if (courseQ.isLoading || enrollmentsQ.isLoading) return <PageShell><Spinner label="Loading lesson" /></PageShell>
  if (courseQ.isError || !course) return <PageShell><ErrorState message={courseQ.error?.message ?? "Course not found."} onRetry={() => courseQ.refetch()} /></PageShell>

  const allLessons = course.curriculum.flatMap(m => m.lessons.map(l => ({ ...l, moduleTitle: m.title })))

  // /learn/:courseId with no lesson: jump to the next unfinished lesson
  if (!lessonId) {
    const target = enrollment?.nextLesson?.id ?? allLessons[0]?.id
    return target ? <Navigate to={`/learn/${course.id}/${target}`} replace /> : <PageShell><ErrorState message="This course has no lessons yet." /></PageShell>
  }

  const currentIdx = allLessons.findIndex(l => l.id === lessonId)
  const currentLesson = allLessons[currentIdx]
  if (!currentLesson) return <PageShell><ErrorState message="Lesson not found." /></PageShell>

  const locked = lessonQ.error instanceof ApiError && (lessonQ.error.status === 403 || lessonQ.error.status === 401)
  if (locked) {
    return (
      <PageShell narrow>
        <div className="text-center bg-white rounded-2xl border border-slate-100 p-10">
          <Lock className="mx-auto text-slate-300 mb-3" size={36} />
          <h1 className="text-xl font-bold text-slate-900">Course locked</h1>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">{lessonQ.error instanceof ApiError && lessonQ.error.status === 401 ? "Sign in to open this lesson." : "Paid lessons open only after the server verifies your Chapa payment. A checkout success message by itself does not unlock this course."}</p>
          <button onClick={() => selectCourse(course)} className="mt-5 px-5 py-2.5 rounded-xl bg-[#7C3AED] text-white font-semibold">Back to course</button>
        </div>
      </PageShell>
    )
  }

  const content = lessonQ.data
  const isCompleted = enrollment?.completedLessonIds.includes(lessonId) ?? false

  const handleComplete = () => {
    const goNext = () => {
      const next = allLessons[currentIdx + 1]
      if (next) startLesson(course.id, next.id)
      else navigate("student-dashboard")
    }
    if (isCompleted) return goNext()
    complete.mutate({ courseId: course.id, lessonId }, {
      onSuccess: e => { if (e.progress >= 100) toast.success("Course complete! Your certificate is ready."); goNext() },
      onError: err => toast.error(err.message),
    })
  }

  const submitQuiz = async () => {
    setSubmitting(true)
    try { setResult(await coursesApi.submitQuiz(course.id, lessonId, { answers })) }
    catch (err) { toast.error(err instanceof Error ? err.message : "Could not submit the quiz") }
    finally { setSubmitting(false) }
  }

  return (
    <div className="min-h-screen bg-[#F8F7FF] pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"><ChevronLeft size={16} /> Back to Dashboard</Link>

        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          <aside className="hidden lg:block" aria-label="Course lessons">
            <div className="bg-white rounded-xl border border-gray-100 p-4 sticky top-24">
              <h2 className="font-semibold text-gray-900 text-sm mb-1">{course.title}</h2>
              {enrollment && <p className="text-xs text-slate-400 mb-3">{enrollment.progress}% complete</p>}
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {course.curriculum.map(mod => (
                  <div key={mod.id}>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">{mod.title}</p>
                    <div className="space-y-1">
                      {mod.lessons.map(lesson => {
                        const done = enrollment?.completedLessonIds.includes(lesson.id)
                        const active = lesson.id === lessonId
                        return (
                          <button key={lesson.id} onClick={() => startLesson(course.id, lesson.id)} aria-current={active ? "step" : undefined}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-2 ${active ? "bg-purple-50 text-purple-700 font-medium" : done ? "text-green-600" : "text-gray-600 hover:bg-gray-50"}`}>
                            {done ? <CheckCircle2 size={12} className="shrink-0" /> : active ? <Play size={12} className="shrink-0" /> : <BookOpen size={12} className="shrink-0 opacity-50" />}
                            <span className="truncate">{lesson.title}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <main id="main">
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{currentLesson.type}</span>
                <span className="text-xs text-gray-400">{currentLesson.duration}</span>
                {isCompleted && <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 size={11} /> Completed</span>}
              </div>
              <h1 className="text-xl font-bold text-gray-900">{currentLesson.title}</h1>
              <p className="text-sm text-gray-500 mt-1">{currentLesson.moduleTitle}</p>
            </div>

            {lessonQ.isLoading && <Spinner label="Loading lesson content" />}
            {lessonQ.isError && !locked && <ErrorState message={lessonQ.error.message} onRetry={() => lessonQ.refetch()} />}

            {content && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <p className="text-gray-700 leading-relaxed">{content.body}</p>
                  {content.codeSnippet && (
                    <div className="mt-4 bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <div className="flex items-center justify-between mb-2"><span className="text-xs text-gray-400 font-mono">{content.language}</span><FileText size={14} className="text-gray-500" /></div>
                      <pre className="text-sm text-green-300 font-mono whitespace-pre-wrap">{content.codeSnippet}</pre>
                    </div>
                  )}
                </div>

                {content.keyTakeaways.length > 0 && (
                  <div className="bg-amber-50 rounded-xl border border-amber-100 p-5">
                    <h2 className="font-semibold text-amber-800 text-sm mb-3 flex items-center gap-2"><Lightbulb size={16} /> Key Takeaways</h2>
                    <ul className="space-y-1.5">{content.keyTakeaways.map((t, i) => <li key={i} className="text-sm text-amber-700 flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />{t}</li>)}</ul>
                  </div>
                )}

                {content.exercises && content.exercises.length > 0 && (
                  <div className="bg-blue-50 rounded-xl border border-blue-100 p-5">
                    <h2 className="font-semibold text-blue-800 text-sm mb-3">Exercises</h2>
                    <ul className="space-y-2">{content.exercises.map((ex, i) => <li key={i} className="text-sm text-blue-700 flex items-start gap-2"><span className="mt-0.5 text-xs font-bold text-blue-400">{i + 1}.</span>{ex}</li>)}</ul>
                  </div>
                )}

                {content.quiz && content.quiz.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h2 className="font-semibold text-gray-900 text-sm mb-4 flex items-center gap-2"><Brain size={16} className="text-purple-600" /> Knowledge Check</h2>
                    <div className="space-y-4">
                      {content.quiz.map((q, qi) => (
                        <fieldset key={q.id}>
                          <legend className="text-sm font-medium text-gray-800 mb-2">{q.question}</legend>
                          <div className="space-y-1.5">
                            {q.options.map((opt, oi) => {
                              const selected = answers[qi] === oi
                              const correct = result && oi === result.correctAnswers[qi]
                              const wrong = result && selected && oi !== result.correctAnswers[qi]
                              return (
                                <button key={oi} type="button" aria-pressed={selected} disabled={!!result}
                                  onClick={() => setAnswers(prev => { const n = [...prev]; n[qi] = oi; return n })}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-colors ${correct ? "bg-green-50 border-green-200 text-green-700" : wrong ? "bg-red-50 border-red-200 text-red-700" : selected ? "bg-purple-50 border-purple-200 text-purple-700" : "border-gray-100 hover:bg-gray-50 text-gray-600"}`}>
                                  {opt}
                                </button>
                              )
                            })}
                          </div>
                        </fieldset>
                      ))}
                    </div>
                    {!result ? (
                      <button onClick={submitQuiz} disabled={submitting || content.quiz.some((_, i) => answers[i] === undefined)} className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-purple-700">
                        {submitting ? "Checking…" : "Submit Answers"}
                      </button>
                    ) : (
                      <div className="mt-4 flex flex-wrap items-center gap-3" role="status">
                        <p className={`text-sm font-medium ${result.passed ? "text-green-600" : "text-red-600"}`}>Score: {result.score}/{result.total} · {result.passed ? "Passed" : "Not passed yet"}</p>
                        {!result.passed && <button onClick={() => { setAnswers([]); setResult(null) }} className="text-sm font-medium text-[#7C3AED]">Try again</button>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <button onClick={() => { const prev = allLessons[currentIdx - 1]; if (prev) startLesson(course.id, prev.id); else navigate("student-dashboard") }} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                <ChevronLeft size={14} /> Previous
              </button>
              <button onClick={handleComplete} disabled={complete.isPending || !enrollment} className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-60">
                {complete.isPending ? "Saving…" : isCompleted ? "Next Lesson" : "Mark Complete"} <ArrowRight size={14} />
              </button>
            </div>
          </main>
        </div>
      </div>

      {enrollment && content && <AITutorChat key={lessonId} courseId={course.id} lessonId={lessonId} lessonTitle={currentLesson.title} />}
    </div>
  )
}
