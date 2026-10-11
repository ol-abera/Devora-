import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical, Save, Send } from "lucide-react"
import { instructorApi, ApiError, type CourseInput, type LessonInput, type ModuleInput, type CourseLevel, type LessonType } from "@/api"
import { useCategories, useInstructorCourse, keys } from "@/hooks/queries"
import { ErrorState, PageShell, Spinner, FieldError } from "@/components/ui"
import { formatEtb } from "@/lib/money"

const LEVELS: CourseLevel[] = ["Beginner", "Intermediate", "Advanced"]
const LESSON_TYPES: LessonType[] = ["video", "reading", "quiz", "project"]

function emptyLesson(): LessonInput {
  return { title: "", duration: "10:00", type: "video", preview: false, body: "" }
}
function emptyModule(): ModuleInput {
  return { title: "", lessons: [emptyLesson()] }
}
function emptyForm(): CourseInput {
  return {
    title: "",
    subtitle: "",
    description: "",
    category: "Web Development",
    level: "Beginner",
    price: 0,
    language: "English",
    tags: [],
    whatYouLearn: [""],
    prerequisites: [""],
    curriculum: [emptyModule()],
  }
}

export default function CourseBuilder() {
  const { courseId } = useParams()
  const isNew = !courseId || courseId === "new"
  const navigate = useNavigate()
  const qc = useQueryClient()
  const categoriesQ = useCategories()
  const existingQ = useInstructorCourse(isNew ? undefined : courseId)

  const [form, setForm] = useState<CourseInput>(emptyForm)
  const [tagsText, setTagsText] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState("")
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [openModules, setOpenModules] = useState<number[]>([0])

  useEffect(() => {
    if (!existingQ.data || isNew) return
    const d = existingQ.data
    setForm({
      title: d.title,
      subtitle: d.subtitle,
      description: d.description,
      category: d.category,
      level: d.level,
      price: d.price,
      language: d.language,
      tags: d.tags,
      whatYouLearn: d.whatYouLearn.length ? d.whatYouLearn : [""],
      prerequisites: d.prerequisites.length ? d.prerequisites : [""],
      curriculum: d.curriculum.length
        ? d.curriculum.map(m => ({
            id: m.id,
            title: m.title,
            lessons: m.lessons.map(l => ({
              id: l.id,
              title: l.title,
              duration: l.duration,
              type: l.type,
              preview: l.preview,
              body: l.body,
              videoUrl: l.videoUrl,
              quiz: l.quiz,
            })),
          }))
        : [emptyModule()],
    })
    setTagsText(d.tags.join(", "))
    setOpenModules(d.curriculum.map((_, i) => i))
  }, [existingQ.data, isNew])

  const set = <K extends keyof CourseInput>(key: K, value: CourseInput[K]) => setForm(f => ({ ...f, [key]: value }))

  const updateModule = (mi: number, patch: Partial<ModuleInput>) => {
    setForm(f => {
      const curriculum = f.curriculum.map((m, i) => (i === mi ? { ...m, ...patch } : m))
      return { ...f, curriculum }
    })
  }
  const updateLesson = (mi: number, li: number, patch: Partial<LessonInput>) => {
    setForm(f => {
      const curriculum = f.curriculum.map((m, i) => {
        if (i !== mi) return m
        const lessons = m.lessons.map((l, j) => (j === li ? { ...l, ...patch } : l))
        return { ...m, lessons }
      })
      return { ...f, curriculum }
    })
  }

  const save = async (andSubmit: boolean) => {
    setErrors({})
    setFormError("")
    const payload: CourseInput = {
      ...form,
      tags: tagsText.split(",").map(s => s.trim()).filter(Boolean),
      whatYouLearn: form.whatYouLearn.map(s => s.trim()).filter(Boolean),
      prerequisites: form.prerequisites.map(s => s.trim()).filter(Boolean),
      price: Number(form.price) || 0,
    }
    if (andSubmit) setSubmitting(true)
    else setSaving(true)
    try {
      let id = courseId
      if (isNew) {
        const created = await instructorApi.createCourse(payload)
        id = created.id
        toast.success("Draft saved")
      } else {
        await instructorApi.updateCourse(courseId!, payload)
        toast.success("Course updated")
      }
      if (andSubmit && id) {
        await instructorApi.submitCourse(id)
        toast.success("Submitted for admin review")
      }
      await qc.invalidateQueries({ queryKey: keys.instructorCourses })
      await qc.invalidateQueries({ queryKey: keys.courses({}) })
      navigate(id ? `/instructor/courses/${id}/edit` : "/instructor")
      if (andSubmit) navigate("/instructor?tab=courses")
    } catch (err) {
      if (err instanceof ApiError && err.fields) setErrors(err.fields)
      setFormError(err instanceof Error ? err.message : "Could not save")
    } finally {
      setSaving(false)
      setSubmitting(false)
    }
  }

  if (!isNew && existingQ.isLoading) return <PageShell><Spinner label="Loading course" /></PageShell>
  if (!isNew && existingQ.isError) return <PageShell><ErrorState message={existingQ.error.message} onRetry={() => existingQ.refetch()} /></PageShell>

  const categories = categoriesQ.data ?? []

  return (
    <PageShell>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <Link to="/instructor?tab=courses" className="text-sm text-[#7C3AED] hover:underline">← My courses</Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">{isNew ? "Create course" : "Edit course"}</h1>
          <p className="text-sm text-slate-500">Curriculum, pricing, and publish when ready</p>
        </div>
        <div className="flex gap-2">
          <button type="button" disabled={saving || submitting} onClick={() => save(false)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium hover:bg-slate-50 disabled:opacity-60">
            <Save size={16} /> {saving ? "Saving…" : "Save draft"}
          </button>
          <button type="button" disabled={saving || submitting} onClick={() => save(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7C3AED] text-white text-sm font-medium hover:bg-[#6D28D9] disabled:opacity-60">
            <Send size={16} /> {submitting ? "Submitting…" : "Save & submit for review"}
          </button>
        </div>
      </div>

      {formError && <p role="alert" className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
            <h2 className="font-semibold text-slate-900">Basics</h2>
            <div>
              <label className="text-xs font-medium text-slate-600">Title</label>
              <input value={form.title} onChange={e => set("title", e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#7C3AED]" />
              <FieldError id="title-err" message={errors.title} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Subtitle</label>
              <input value={form.subtitle} onChange={e => set("subtitle", e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#7C3AED]" />
              <FieldError id="subtitle-err" message={errors.subtitle} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Description</label>
              <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={4} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#7C3AED]" />
              <FieldError id="desc-err" message={errors.description} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Tags (comma-separated)</label>
              <input value={tagsText} onChange={e => setTagsText(e.target.value)} placeholder="typescript, react, api" className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#7C3AED]" />
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Curriculum</h2>
              <button type="button" onClick={() => { setForm(f => ({ ...f, curriculum: [...f.curriculum, emptyModule()] })); setOpenModules(o => [...o, form.curriculum.length]) }} className="text-sm text-[#7C3AED] font-medium inline-flex items-center gap-1">
                <Plus size={14} /> Module
              </button>
            </div>
            <FieldError id="curr-err" message={errors.curriculum} />
            {form.curriculum.map((mod, mi) => (
              <div key={mi} className="border border-slate-100 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50">
                  <GripVertical size={14} className="text-slate-300" />
                  <input value={mod.title} onChange={e => updateModule(mi, { title: e.target.value })} placeholder={`Module ${mi + 1} title`} className="flex-1 bg-transparent text-sm font-medium outline-none" />
                  <button type="button" onClick={() => setOpenModules(o => o.includes(mi) ? o.filter(x => x !== mi) : [...o, mi])} className="p-1 text-slate-400">
                    {openModules.includes(mi) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button type="button" onClick={() => setForm(f => ({ ...f, curriculum: f.curriculum.filter((_, i) => i !== mi) }))} className="p-1 text-red-400 hover:text-red-600" aria-label="Remove module">
                    <Trash2 size={14} />
                  </button>
                </div>
                {openModules.includes(mi) && (
                  <div className="p-3 space-y-3">
                    {mod.lessons.map((les, li) => (
                      <div key={li} className="rounded-lg border border-slate-100 p-3 space-y-2">
                        <div className="flex flex-wrap gap-2">
                          <input value={les.title} onChange={e => updateLesson(mi, li, { title: e.target.value })} placeholder="Lesson title" className="flex-1 min-w-[140px] px-2 py-1.5 rounded-lg border border-slate-200 text-sm" />
                          <input value={les.duration} onChange={e => updateLesson(mi, li, { duration: e.target.value })} placeholder="10:00" className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 text-sm" />
                          <select value={les.type} onChange={e => updateLesson(mi, li, { type: e.target.value as LessonType })} className="px-2 py-1.5 rounded-lg border border-slate-200 text-sm">
                            {LESSON_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <label className="flex items-center gap-1 text-xs text-slate-600">
                            <input type="checkbox" checked={les.preview} onChange={e => updateLesson(mi, li, { preview: e.target.checked })} /> Preview
                          </label>
                          <button type="button" onClick={() => updateModule(mi, { lessons: mod.lessons.filter((_, j) => j !== li) })} className="p-1 text-red-400" aria-label="Remove lesson"><Trash2 size={14} /></button>
                        </div>
                        <textarea value={les.body ?? ""} onChange={e => updateLesson(mi, li, { body: e.target.value })} rows={2} placeholder="Lesson body / script" className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm" />
                        {les.type === "quiz" && (
                          <QuizEditor
                            quiz={les.quiz ?? [{ question: "", options: ["", "", "", ""], correct: 0 }]}
                            onChange={quiz => updateLesson(mi, li, { quiz })}
                          />
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => updateModule(mi, { lessons: [...mod.lessons, emptyLesson()] })} className="text-xs font-medium text-[#7C3AED] inline-flex items-center gap-1">
                      <Plus size={12} /> Lesson
                    </button>
                  </div>
                )}
              </div>
            ))}
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
            <h2 className="font-semibold text-slate-900">Pricing & meta</h2>
            <div>
              <label className="text-xs font-medium text-slate-600">Price (ETB, 0 = free)</label>
              <input type="number" min={0} step={1} value={form.price} onChange={e => set("price", Number(e.target.value))} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
              <p className="text-xs text-slate-400 mt-1">{formatEtb(Number(form.price) || 0)}</p>
              <FieldError id="price-err" message={errors.price} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Category</label>
              <select value={form.category} onChange={e => set("category", e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                {!categories.length && <option value="Web Development">Web Development</option>}
              </select>
              <FieldError id="cat-err" message={errors.category} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Level</label>
              <select value={form.level} onChange={e => set("level", e.target.value as CourseLevel)} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Language</label>
              <input value={form.language} onChange={e => set("language", e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
            <h2 className="font-semibold text-slate-900">What you will learn</h2>
            {form.whatYouLearn.map((w, i) => (
              <div key={i} className="flex gap-2">
                <input value={w} onChange={e => set("whatYouLearn", form.whatYouLearn.map((x, j) => j === i ? e.target.value : x))} className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                <button type="button" onClick={() => set("whatYouLearn", form.whatYouLearn.filter((_, j) => j !== i))} className="text-red-400"><Trash2 size={14} /></button>
              </div>
            ))}
            <button type="button" onClick={() => set("whatYouLearn", [...form.whatYouLearn, ""])} className="text-xs text-[#7C3AED] font-medium">+ Add</button>
          </section>

          <section className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
            <h2 className="font-semibold text-slate-900">Prerequisites</h2>
            {form.prerequisites.map((w, i) => (
              <div key={i} className="flex gap-2">
                <input value={w} onChange={e => set("prerequisites", form.prerequisites.map((x, j) => j === i ? e.target.value : x))} className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                <button type="button" onClick={() => set("prerequisites", form.prerequisites.filter((_, j) => j !== i))} className="text-red-400"><Trash2 size={14} /></button>
              </div>
            ))}
            <button type="button" onClick={() => set("prerequisites", [...form.prerequisites, ""])} className="text-xs text-[#7C3AED] font-medium">+ Add</button>
          </section>
        </div>
      </div>
    </PageShell>
  )
}

function QuizEditor({
  quiz,
  onChange,
}: {
  quiz: NonNullable<LessonInput["quiz"]>
  onChange: (q: NonNullable<LessonInput["quiz"]>) => void
}) {
  return (
    <div className="bg-slate-50 rounded-lg p-2 space-y-2">
      <p className="text-xs font-medium text-slate-600">Quiz questions</p>
      {quiz.map((q, qi) => (
        <div key={qi} className="space-y-1 border-b border-slate-100 pb-2">
          <input value={q.question} onChange={e => onChange(quiz.map((x, i) => i === qi ? { ...x, question: e.target.value } : x))} placeholder="Question" className="w-full px-2 py-1 rounded border border-slate-200 text-xs" />
          {q.options.map((opt, oi) => (
            <div key={oi} className="flex items-center gap-2">
              <input type="radio" name={`correct-${qi}`} checked={q.correct === oi} onChange={() => onChange(quiz.map((x, i) => i === qi ? { ...x, correct: oi } : x))} />
              <input value={opt} onChange={e => onChange(quiz.map((x, i) => i === qi ? { ...x, options: x.options.map((o, j) => j === oi ? e.target.value : o) } : x))} className="flex-1 px-2 py-1 rounded border border-slate-200 text-xs" placeholder={`Option ${oi + 1}`} />
            </div>
          ))}
          <button type="button" className="text-[11px] text-red-500" onClick={() => onChange(quiz.filter((_, i) => i !== qi))}>Remove question</button>
        </div>
      ))}
      <button type="button" className="text-xs text-[#7C3AED]" onClick={() => onChange([...quiz, { question: "", options: ["", "", "", ""], correct: 0 }])}>+ Question</button>
    </div>
  )
}
