/**
 * In-browser fake backend. It implements the SAME endpoints as docs/API_CONTRACT.md so the UI can be
 * built and demoed before the Express server exists. Turned on with VITE_USE_MOCK=true.
 * Nothing in the UI knows about this file; only api/http.ts calls it.
 * Data is saved in localStorage ("devora_mock_db"). Never ship with VITE_USE_MOCK=true.
 */
import { ApiError } from "../http"
import type {
  AppNotification, AuthResponse, Certificate, CourseDetail, CourseQuery, CourseSummary, Enrollment, LessonContent,
  Paginated, Payment, PaymentStatus, Profile, QuizResult, Review, Role, TutorMessage,
} from "../types"
import { categories, courses as seedCourses, lessonContents, playgroundChallenges, instructorStats } from "../../seed-data"

interface DbUser { id: string; name: string; email: string; password: string; role: Role; createdAt: string; status: "active" | "suspended" | "pending"; weeklyReminder: boolean; weeklyGoal: number }
interface DbEnrollment { userId: string; courseId: string; enrolledAt: string; completed: string[]; source: "free" | "payment" }
interface DbPayment extends Payment { userId: string; providerStatus: PaymentStatus | null }
interface Db {
  users: DbUser[]
  enrollments: DbEnrollment[]
  bookmarks: { userId: string; courseId: string }[]
  payments: DbPayment[]
  certificates: (Certificate & { userId: string })[]
  notifications: (AppNotification & { userId: string })[]
  reviews: Review[]
  resetTokens: Record<string, string>
}

const KEY = "devora_mock_db"
const PASS_MARK = 0.6

function seedDb(): Db {
  const now = new Date().toISOString()
  return {
    users: [
      { id: "u-student", name: "Abebe Bekele", email: "student@devora.et", password: "password123", role: "student", createdAt: now, status: "active", weeklyReminder: false, weeklyGoal: 5 },
      { id: "i1", name: "Sarah Chen", email: "instructor@devora.et", password: "password123", role: "instructor", createdAt: now, status: "active", weeklyReminder: false, weeklyGoal: 5 },
      { id: "u-admin", name: "Admin", email: "admin@devora.et", password: "password123", role: "admin", createdAt: now, status: "active", weeklyReminder: false, weeklyGoal: 5 },
    ],
    enrollments: [], bookmarks: [], payments: [], certificates: [], notifications: [], reviews: [], resetTokens: {},
  }
}

function load(): Db {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Db
  } catch { /* ignore */ }
  return seedDb()
}
function save(db: Db) {
  try { localStorage.setItem(KEY, JSON.stringify(db)) } catch { /* ignore */ }
}

const wait = (ms = 250) => new Promise(r => setTimeout(r, ms))
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 10)}`
const initials = (name: string) => name.split(" ").filter(Boolean).map(w => w[0]).join("").toUpperCase().slice(0, 2) || "U"

function toProfile(u: DbUser): Profile {
  return { id: u.id, name: u.name, email: u.email, role: u.role, avatar: initials(u.name), createdAt: u.createdAt, status: u.status, weeklyReminder: u.weeklyReminder, weeklyGoal: u.weeklyGoal, lessonsThisWeek: mockLessonsThisWeek(u.id) }
}
// The mock does not store completion dates, so "this week" is approximated by all completed lessons.
function mockLessonsThisWeek(userId: string): number {
  return load().enrollments.filter(e => e.userId === userId).reduce((n, e) => n + e.completed.length, 0)
}
function toSummary(c: (typeof seedCourses)[number]): CourseSummary {
  return {
    id: c.id, title: c.title, subtitle: c.subtitle, category: c.category, level: c.level, price: c.price, originalPrice: c.originalPrice,
    rating: c.rating, reviews: c.reviews, students: c.students, duration: c.duration, lessons: c.lessons, image: c.image, tags: c.tags,
    featured: c.featured, popular: c.popular, lastUpdated: new Date(c.lastUpdated).toISOString(),
    instructor: { id: c.instructor.id, name: c.instructor.name, title: c.instructor.title, avatar: c.instructor.avatar },
  }
}
function toDetail(c: (typeof seedCourses)[number]): CourseDetail {
  return { ...toSummary(c), description: c.description, language: c.language, whatYouLearn: c.whatYouLearn, prerequisites: c.prerequisites, instructor: c.instructor, curriculum: c.curriculum }
}
function progressOf(courseId: string, done: string[]) {
  const course = seedCourses.find(c => c.id === courseId)
  const total = course?.curriculum.reduce((n, m) => n + m.lessons.length, 0) ?? 1
  return Math.min(100, Math.round((done.length / total) * 100))
}
function toEnrollment(e: DbEnrollment): Enrollment {
  const course = seedCourses.find(c => c.id === e.courseId)!
  const next = course.curriculum.flatMap(m => m.lessons).find(l => !e.completed.includes(l.id))
  return {
    courseId: e.courseId, enrolledAt: e.enrolledAt, progress: progressOf(e.courseId, e.completed), completedLessonIds: e.completed,
    source: e.source, nextLesson: next ? { id: next.id, title: next.title } : null, course: toSummary(course),
  }
}

function tutorReply(msg: string, ctx: { title: string; takeaway: string }): string {
  const q = msg.toLowerCase()
  if (q.includes("exercise") || q.includes("practice")) return "Try changing one small part of the lesson code and predict what breaks before you run it."
  if (q.includes("mistake") || q.includes("error")) return `A common mistake here is skipping edge cases. Re-read the key idea: "${ctx.takeaway}".`
  if (q.includes("explain") || q.includes("simply")) return `In "${ctx.title}" the key idea is: ${ctx.takeaway}. Which part feels unclear to you?`
  return `Good question. What have you tried so far for "${ctx.title}"? Start from: ${ctx.takeaway}.`
}

type Ctx = { db: Db; user: DbUser | null; query: Record<string, unknown>; body: any; params: string[] }
type Handler = (ctx: Ctx) => unknown
const routes: { method: string; re: RegExp; auth: boolean; roles?: Role[]; handler: Handler }[] = []
function route(method: string, pattern: string, opts: { auth?: boolean; roles?: Role[] }, handler: Handler) {
  routes.push({ method, re: new RegExp(`^${pattern}$`), auth: opts.auth ?? true, roles: opts.roles, handler })
}
const need = (u: DbUser | null): DbUser => { if (!u) throw new ApiError(401, "Please sign in."); return u }
const notify = (db: Db, userId: string, n: Omit<AppNotification, "id" | "read" | "createdAt">) =>
  db.notifications.unshift({ ...n, id: uid("n"), read: false, createdAt: new Date().toISOString(), userId })

/* ---------------- auth ---------------- */
route("POST", "/auth/register", { auth: false }, ({ db, body }) => {
  const email = String(body?.email ?? "").trim().toLowerCase()
  const fields: Record<string, string> = {}
  if (String(body?.name ?? "").trim().length < 2) fields.name = "Enter your full name"
  if (!/^\S+@\S+\.\S+$/.test(email)) fields.email = "Enter a valid email"
  if (String(body?.password ?? "").length < 8) fields.password = "Use at least 8 characters"
  if (Object.keys(fields).length) throw new ApiError(422, "Please fix the highlighted fields.", "VALIDATION", fields)
  if (db.users.some(u => u.email === email)) throw new ApiError(409, "An account with this email already exists.", "EMAIL_TAKEN", { email: "Already registered" })
  const role: Role = body.role === "instructor" ? "instructor" : "student"
  const user: DbUser = { id: uid("u"), name: String(body.name).trim(), email, password: body.password, role, createdAt: new Date().toISOString(), status: "active", weeklyReminder: false, weeklyGoal: 5 }
  db.users.push(user)
  notify(db, user.id, { title: "Welcome to Devora", body: "Browse the catalog and start your first course.", type: "system", link: "/courses" })
  return { user: toProfile(user), token: `mock.${user.id}` } satisfies AuthResponse
})
route("POST", "/auth/login", { auth: false }, ({ db, body }) => {
  const user = db.users.find(u => u.email === String(body?.email ?? "").trim().toLowerCase())
  if (!user || user.password !== body?.password) throw new ApiError(401, "Wrong email or password.", "INVALID_CREDENTIALS")
  if (user.status === "suspended") throw new ApiError(403, "This account is suspended. Contact support.", "SUSPENDED")
  return { user: toProfile(user), token: `mock.${user.id}` } satisfies AuthResponse
})
route("POST", "/auth/logout", {}, () => undefined)
route("GET", "/auth/me", {}, ({ user }) => toProfile(need(user)))
route("POST", "/auth/forgot-password", { auth: false }, ({ db, body }) => {
  const email = String(body?.email ?? "").trim().toLowerCase()
  if (db.users.some(u => u.email === email)) {
    const token = uid("reset")
    db.resetTokens[token] = email
    console.info(`[mock] Password reset link: ${location.origin}/reset-password?token=${token}`)
  }
  // Always the same answer so attackers cannot find out which emails exist
  return { message: "If that email has an account, a reset link has been sent." }
})
route("POST", "/auth/reset-password", { auth: false }, ({ db, body }) => {
  const email = db.resetTokens[String(body?.token ?? "")]
  if (!email) throw new ApiError(400, "This reset link is invalid or has expired.", "INVALID_TOKEN")
  if (String(body?.password ?? "").length < 8) throw new ApiError(422, "Use at least 8 characters.", "VALIDATION", { password: "Use at least 8 characters" })
  const user = db.users.find(u => u.email === email)!
  user.password = body.password
  delete db.resetTokens[body.token]
  return { message: "Password updated. You can sign in now." }
})
route("PATCH", "/me", {}, ({ user, body }) => {
  const u = need(user)
  if (typeof body?.name === "string" && body.name.trim().length >= 2) u.name = body.name.trim()
  if (typeof body?.weeklyReminder === "boolean") u.weeklyReminder = body.weeklyReminder
  if (typeof body?.weeklyGoal === "number") u.weeklyGoal = Math.max(1, Math.min(30, Math.round(body.weeklyGoal)))
  return toProfile(u)
})

/* ---------------- public catalog ---------------- */
route("GET", "/categories", { auth: false }, () => categories)
route("GET", "/courses", { auth: false }, ({ query }) => {
  const q = query as CourseQuery
  let list = [...seedCourses]
  if (q.search) {
    const s = String(q.search).toLowerCase()
    list = list.filter(c => c.title.toLowerCase().includes(s) || c.category.toLowerCase().includes(s) || c.tags.some(t => t.toLowerCase().includes(s)))
  }
  if (q.category) list = list.filter(c => c.category === q.category)
  if (q.level) list = list.filter(c => c.level === q.level)
  if (q.price === "free") list = list.filter(c => c.price === 0)
  if (q.price === "paid") list = list.filter(c => c.price > 0)
  if (String(q.featured) === "true") list = list.filter(c => c.featured)
  const sorters: Record<string, (a: typeof list[number], b: typeof list[number]) => number> = {
    popular: (a, b) => b.students - a.students,
    rating: (a, b) => b.rating - a.rating,
    newest: (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
    "price-low": (a, b) => a.price - b.price,
    "price-high": (a, b) => b.price - a.price,
  }
  list.sort(sorters[q.sort ?? "popular"] ?? sorters.popular)
  const page = Number(q.page ?? 1), limit = Number(q.limit ?? 50)
  return { items: list.slice((page - 1) * limit, page * limit).map(toSummary), total: list.length, page, limit } satisfies Paginated<CourseSummary>
})
route("GET", "/courses/([^/]+)", { auth: false }, ({ params }) => {
  const c = seedCourses.find(x => x.id === params[0])
  if (!c) throw new ApiError(404, "Course not found.", "NOT_FOUND")
  return toDetail(c)
})
const sampleReviews = (courseId: string): Review[] => [
  { id: `${courseId}-r1`, courseId, author: "Hana Tadesse", avatar: "HT", rating: 5, comment: "Clear explanations and great projects. Worth every birr.", createdAt: "2025-02-11T09:00:00.000Z" },
  { id: `${courseId}-r2`, courseId, author: "Dawit Alemu", avatar: "DA", rating: 4, comment: "Good pace. I would like more exercises in the later modules.", createdAt: "2025-01-03T09:00:00.000Z" },
]
route("GET", "/courses/([^/]+)/reviews", { auth: false }, ({ db, params }) => {
  const items = [...db.reviews.filter(r => r.courseId === params[0]), ...sampleReviews(params[0])]
  return { items, total: items.length, page: 1, limit: items.length } satisfies Paginated<Review>
})
route("POST", "/courses/([^/]+)/reviews", {}, ({ db, user, params, body }) => {
  const u = need(user)
  if (!db.enrollments.some(e => e.userId === u.id && e.courseId === params[0])) throw new ApiError(403, "Only enrolled students can leave a review.", "NOT_ENROLLED")
  const rating = Number(body?.rating)
  if (!(rating >= 1 && rating <= 5)) throw new ApiError(422, "Choose 1 to 5 stars.", "VALIDATION", { rating: "Choose 1 to 5 stars" })
  const review: Review = { id: uid("r"), courseId: params[0], author: u.name, avatar: initials(u.name), rating, comment: String(body?.comment ?? "").slice(0, 1000), createdAt: new Date().toISOString() }
  db.reviews.unshift(review)
  return review
})
route("GET", "/playground/challenges", {}, () => playgroundChallenges)
route("GET", "/certificates/verify/([^/]+)", { auth: false }, ({ db, params }) => {
  const cert = db.certificates.find(c => c.credentialId === decodeURIComponent(params[0]))
  if (!cert) return { valid: false }
  const { userId: _u, ...certificate } = cert
  return { valid: true, certificate }
})

/* ---------------- student ---------------- */
route("GET", "/me/enrollments", {}, ({ db, user }) => db.enrollments.filter(e => e.userId === need(user).id).map(toEnrollment))
route("POST", "/courses/([^/]+)/enroll", {}, ({ db, user, params }) => {
  const u = need(user)
  const c = seedCourses.find(x => x.id === params[0])
  if (!c) throw new ApiError(404, "Course not found.", "NOT_FOUND")
  if (c.price > 0) throw new ApiError(403, "This course is paid. Complete checkout to enroll.", "PAYMENT_REQUIRED")
  let e = db.enrollments.find(x => x.userId === u.id && x.courseId === c.id)
  if (!e) {
    e = { userId: u.id, courseId: c.id, enrolledAt: new Date().toISOString(), completed: [], source: "free" }
    db.enrollments.push(e)
  }
  return toEnrollment(e)
})
function findLesson(courseId: string, lessonId: string) {
  const c = seedCourses.find(x => x.id === courseId)
  const lesson = c?.curriculum.flatMap(m => m.lessons).find(l => l.id === lessonId)
  if (!c || !lesson) throw new ApiError(404, "Lesson not found.", "NOT_FOUND")
  return { c, lesson }
}
route("GET", "/courses/([^/]+)/lessons/([^/]+)", { auth: false }, ({ db, user, params }) => {
  const { lesson } = findLesson(params[0], params[1])
  const enrolled = user && db.enrollments.some(e => e.userId === user.id && e.courseId === params[0])
  if (!lesson.preview) {
    if (!user) throw new ApiError(401, "Sign in to continue.")
    if (!enrolled) throw new ApiError(403, "Enroll in this course to open this lesson.", "NOT_ENROLLED")
  }
  const seed = lessonContents[lesson.id]
  return {
    id: lesson.id, courseId: params[0], title: lesson.title,
    body: seed?.body ?? "Lesson content will appear here.",
    codeSnippet: seed?.codeSnippet, language: seed?.language, exercises: seed?.exercises,
    keyTakeaways: seed?.keyTakeaways ?? [],
    quiz: seed?.quiz?.map((q, i) => ({ id: `${lesson.id}-q${i}`, question: q.question, options: q.options })),
  } satisfies LessonContent
})
route("POST", "/courses/([^/]+)/lessons/([^/]+)/complete", {}, ({ db, user, params }) => {
  const u = need(user)
  findLesson(params[0], params[1])
  const e = db.enrollments.find(x => x.userId === u.id && x.courseId === params[0])
  if (!e) throw new ApiError(403, "Enroll in this course first.", "NOT_ENROLLED")
  if (!e.completed.includes(params[1])) e.completed.push(params[1])
  const course = seedCourses.find(c => c.id === params[0])!
  if (progressOf(e.courseId, e.completed) >= 100 && !db.certificates.some(c => c.userId === u.id && c.courseId === e.courseId)) {
    db.certificates.push({
      id: uid("cert"), userId: u.id, courseId: e.courseId, courseTitle: course.title, studentName: u.name,
      issuedAt: new Date().toISOString(), credentialId: `DEV-${e.courseId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
    })
    notify(db, u.id, { title: "Certificate earned", body: `You completed ${course.title}.`, type: "certificate", link: "/certificates" })
  }
  return toEnrollment(e)
})
route("POST", "/courses/([^/]+)/lessons/([^/]+)/quiz", {}, ({ db, user, params, body }) => {
  const u = need(user)
  const { lesson } = findLesson(params[0], params[1])
  if (!db.enrollments.some(e => e.userId === u.id && e.courseId === params[0])) throw new ApiError(403, "Enroll in this course first.", "NOT_ENROLLED")
  const quiz = lessonContents[lesson.id]?.quiz
  if (!quiz?.length) throw new ApiError(404, "This lesson has no quiz.", "NOT_FOUND")
  const answers: number[] = Array.isArray(body?.answers) ? body.answers : []
  const score = quiz.filter((q, i) => answers[i] === q.correct).length
  return { score, total: quiz.length, passed: score / quiz.length >= PASS_MARK, correctAnswers: quiz.map(q => q.correct), attemptedAt: new Date().toISOString() } satisfies QuizResult
})
route("GET", "/me/bookmarks", {}, ({ db, user }) =>
  db.bookmarks.filter(b => b.userId === need(user).id).map(b => seedCourses.find(c => c.id === b.courseId)).filter(Boolean).map(c => toSummary(c!)))
route("PUT", "/me/bookmarks/([^/]+)", {}, ({ db, user, params }) => {
  const u = need(user)
  if (!db.bookmarks.some(b => b.userId === u.id && b.courseId === params[0])) db.bookmarks.push({ userId: u.id, courseId: params[0] })
})
route("DELETE", "/me/bookmarks/([^/]+)", {}, ({ db, user, params }) => {
  const u = need(user)
  db.bookmarks = db.bookmarks.filter(b => !(b.userId === u.id && b.courseId === params[0]))
})
route("GET", "/me/certificates", {}, ({ db, user }) => db.certificates.filter(c => c.userId === need(user).id).map(({ userId: _u, ...c }) => c))
route("GET", "/me/notifications", {}, ({ db, user }) => db.notifications.filter(n => n.userId === need(user).id).map(({ userId: _u, ...n }) => n))
route("POST", "/me/notifications/read-all", {}, ({ db, user }) => { db.notifications.forEach(n => { if (n.userId === need(user).id) n.read = true }) })
route("POST", "/me/notifications/([^/]+)/read", {}, ({ db, user, params }) => {
  const n = db.notifications.find(x => x.id === params[0] && x.userId === need(user).id)
  if (n) n.read = true
})
route("POST", "/ai-tutor/chat", {}, ({ user, body }) => {
  need(user)
  const { lesson } = findLesson(String(body?.courseId), String(body?.lessonId))
  const last = [...((body?.messages ?? []) as TutorMessage[])].reverse().find(m => m.role === "user")
  return { reply: tutorReply(last?.text ?? "", { title: lesson.title, takeaway: lessonContents[lesson.id]?.keyTakeaways?.[0] ?? "the core idea of this lesson" }) }
})

/* ---------------- payments ---------------- */
const stripPayment = ({ userId: _u, providerStatus: _p, ...p }: DbPayment): Payment => p
route("POST", "/payments/chapa/initialize", {}, ({ db, user, body }) => {
  const u = need(user)
  const course = seedCourses.find(c => c.id === body?.courseId)
  if (!course) throw new ApiError(404, "Course not found.", "NOT_FOUND")
  if (course.price <= 0) throw new ApiError(400, "This course is free. Enroll directly.", "FREE_COURSE")
  if (db.enrollments.some(e => e.userId === u.id && e.courseId === course.id)) throw new ApiError(409, "You already own this course.", "ALREADY_ENROLLED")
  const digits = String(body?.phone ?? "").replace(/\D/g, "")
  const local = digits.startsWith("251") ? digits.slice(3) : digits.replace(/^0/, "")
  const fields: Record<string, string> = {}
  if (String(body?.fullName ?? "").trim().length < 2) fields.fullName = "Enter the name on the payment"
  if (!/^\S+@\S+\.\S+$/.test(String(body?.email ?? ""))) fields.email = "Enter a valid email"
  if (!/^9\d{8}$/.test(local)) fields.phone = "Use an Ethiopian mobile number, like 0911 234 567"
  if (Object.keys(fields).length) throw new ApiError(422, "Please fix the highlighted fields.", "VALIDATION", fields)
  const txRef = `DV-${course.id}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`.toUpperCase()
  db.payments.unshift({
    txRef, userId: u.id, courseId: course.id, courseTitle: course.title, amountEtb: course.price, status: "pending", accessGranted: false,
    providerReference: null, email: String(body.email).trim(), phone: `+251${local}`, buyerName: String(body.fullName).trim(),
    createdAt: new Date().toISOString(), paidAt: null, providerStatus: null,
  })
  return { txRef, checkoutUrl: `${location.origin}/mock-chapa/${txRef}` }
})
// MOCK ONLY: stands in for the customer finishing (or abandoning) payment on Chapa's own page.
route("POST", "/mock/chapa/([^/]+)/settle", {}, ({ db, params, body }) => {
  const p = db.payments.find(x => x.txRef === params[0])
  if (!p) throw new ApiError(404, "Unknown transaction.", "NOT_FOUND")
  p.providerStatus = body?.status as PaymentStatus
})
route("POST", "/payments/([^/]+)/verify", {}, ({ db, user, params }) => {
  const u = need(user)
  const p = db.payments.find(x => x.txRef === decodeURIComponent(params[0]) && x.userId === u.id)
  if (!p) throw new ApiError(404, "Payment not found.", "NOT_FOUND")
  if (p.status === "pending" && p.providerStatus) {
    p.status = p.providerStatus
    if (p.status === "success") {
      p.accessGranted = true
      p.paidAt = new Date().toISOString()
      p.providerReference = `CHAPA-${p.txRef.slice(-8)}`
      if (!db.enrollments.some(e => e.userId === u.id && e.courseId === p.courseId)) {
        db.enrollments.push({ userId: u.id, courseId: p.courseId, enrolledAt: p.paidAt, completed: [], source: "payment" })
      }
      notify(db, u.id, { title: "Payment confirmed", body: `You can now start ${p.courseTitle}.`, type: "payment", link: `/purchases/${p.txRef}` })
    }
  }
  return stripPayment(p)
})
route("GET", "/payments/([^/]+)", {}, ({ db, user, params }) => {
  const p = db.payments.find(x => x.txRef === decodeURIComponent(params[0]) && x.userId === need(user).id)
  if (!p) throw new ApiError(404, "Payment not found.", "NOT_FOUND")
  return stripPayment(p)
})
route("GET", "/me/payments", {}, ({ db, user }) => db.payments.filter(p => p.userId === need(user).id).map(stripPayment))

/* ---------------- instructor ---------------- */
route("GET", "/instructor/stats", { roles: ["instructor", "admin"] }, () => ({
  totalRevenueEtb: instructorStats.totalRevenue * 57,
  activeStudents: instructorStats.activeStudents,
  avgRating: instructorStats.avgRating,
  monthlyGrowthPct: instructorStats.monthlyGrowth,
  revenueByMonth: instructorStats.revenueByMonth.map(v => v * 57),
  enrollmentByMonth: instructorStats.enrollmentByMonth,
  topCourses: instructorStats.topCourses.map(t => ({ courseId: t.id, title: seedCourses.find(c => c.id === t.id)?.title ?? t.id, enrollments: t.enrollments, revenueEtb: t.revenue * 57 })),
}))

/* ---------------- dispatcher ---------------- */
export async function mockRequest(method: string, path: string, query: Record<string, unknown>, body: unknown, token: string | null): Promise<unknown> {
  await wait()
  const db = load()
  const userId = token?.startsWith("mock.") ? token.slice(5) : null
  const user = userId ? db.users.find(u => u.id === userId) ?? null : null
  for (const r of routes) {
    if (r.method !== method) continue
    const m = r.re.exec(path)
    if (!m) continue
    if (r.auth && !user) throw new ApiError(401, "Please sign in.")
    if (r.roles && (!user || !r.roles.includes(user.role))) throw new ApiError(403, "You do not have access to this page.", "FORBIDDEN")
    const result = r.handler({ db, user, query, body, params: m.slice(1) })
    save(db)
    return result === undefined ? undefined : JSON.parse(JSON.stringify(result))
  }
  throw new ApiError(404, `No mock route for ${method} ${path}`, "NOT_FOUND")
}
