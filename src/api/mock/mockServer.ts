/**
 * In-browser fake backend. It implements the SAME endpoints as docs/API_CONTRACT.md so the UI can be
 * built and demoed before the Express server exists. Turned on with VITE_USE_MOCK=true.
 * Nothing in the UI knows about this file; only api/http.ts calls it.
 * Data is saved in localStorage ("devora_mock_db"). Never ship with VITE_USE_MOCK=true.
 */
import { ApiError } from "../http"
import type {
  AdminAuditEntry, AdminOverview, AdminPendingCourse, AdminReport, AdminTransaction, AdminUserRow, AppNotification, AuthResponse, Certificate, CourseDetail, CourseLevel, CourseQuery, CourseStatus, CourseSummary, Enrollment, LessonContent,
  LessonType, Paginated, Payment, PaymentStatus, Profile, QuizResult, Review, Role, SupportTicket, TutorMessage,
} from "../types"
import { categories, courses as seedCourses, lessonContents, playgroundChallenges, instructorStats } from "../../seed-data"

interface DbUser { id: string; name: string; email: string; password: string; role: Role; createdAt: string; status: "active" | "suspended" | "pending"; weeklyReminder: boolean; weeklyGoal: number; locale?: "en" | "am" | "om" }
interface DbEnrollment { userId: string; courseId: string; enrolledAt: string; completed: string[]; source: "free" | "payment" }
interface DbPayment extends Payment { userId: string; providerStatus: PaymentStatus | null }
interface DbInstructorCourse {
  ownerId: string
  status: CourseStatus
  rejectionReason?: string
  id: string
  title: string
  subtitle: string
  description: string
  category: string
  level: CourseLevel
  price: number
  originalPrice: number
  language: string
  tags: string[]
  whatYouLearn: string[]
  prerequisites: string[]
  curriculum: {
    id: string
    title: string
    lessons: {
      id: string
      title: string
      duration: string
      type: LessonType
      preview: boolean
      body?: string
      videoUrl?: string
      quiz?: { id: string; question: string; options: string[]; correct: number }[]
    }[]
  }[]
  createdAt: string
  lastUpdated: string
  rating: number
  reviews: number
  students: number
  featured: boolean
  popular: boolean
  image: string
}

interface Db {
  users: DbUser[]
  enrollments: DbEnrollment[]
  bookmarks: { userId: string; courseId: string }[]
  payments: DbPayment[]
  certificates: (Certificate & { userId: string })[]
  notifications: (AppNotification & { userId: string })[]
  reviews: Review[]
  resetTokens: Record<string, string>
  instructorCourses: DbInstructorCourse[]
  auditLog: AdminAuditEntry[]
  tickets: SupportTicket[]
  reports: AdminReport[]
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
    enrollments: [], bookmarks: [], payments: [], certificates: [], notifications: [], reviews: [], resetTokens: {}, instructorCourses: [], auditLog: [], tickets: [], reports: [],
  }
}

function load(): Db {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const db = JSON.parse(raw) as Db
      if (!Array.isArray(db.instructorCourses)) db.instructorCourses = []
      if (!Array.isArray(db.auditLog)) db.auditLog = []
      if (!Array.isArray(db.tickets)) db.tickets = []
      if (!Array.isArray(db.reports)) db.reports = []
      return db
    }
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
  return { id: u.id, name: u.name, email: u.email, role: u.role, avatar: initials(u.name), createdAt: u.createdAt, status: u.status, weeklyReminder: u.weeklyReminder, weeklyGoal: u.weeklyGoal, lessonsThisWeek: mockLessonsThisWeek(u.id), locale: u.locale }
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
  if (course) {
    const total = course.curriculum.reduce((n, m) => n + m.lessons.length, 0) || 1
    return Math.min(100, Math.round((done.length / total) * 100))
  }
  const ic = load().instructorCourses.find(c => c.id === courseId)
  const total = ic?.curriculum.reduce((n, m) => n + m.lessons.length, 0) || 1
  return Math.min(100, Math.round((done.length / total) * 100))
}
function toEnrollment(e: DbEnrollment): Enrollment {
  const seed = seedCourses.find(c => c.id === e.courseId)
  if (seed) {
    const next = seed.curriculum.flatMap(m => m.lessons).find(l => !e.completed.includes(l.id))
    return {
      courseId: e.courseId, enrolledAt: e.enrolledAt, progress: progressOf(e.courseId, e.completed), completedLessonIds: e.completed,
      source: e.source, nextLesson: next ? { id: next.id, title: next.title } : null, course: toSummary(seed),
    }
  }
  const ic = load().instructorCourses.find(c => c.id === e.courseId)
  if (!ic) {
    // orphan enrollment
    return {
      courseId: e.courseId, enrolledAt: e.enrolledAt, progress: 0, completedLessonIds: e.completed, source: e.source,
      nextLesson: null,
      course: { id: e.courseId, title: "Course", subtitle: "", category: "", level: "Beginner", price: 0, originalPrice: 0, rating: 0, reviews: 0, students: 0, duration: "", lessons: 0, image: "", tags: [], featured: false, popular: false, lastUpdated: e.enrolledAt, instructor: { id: "", name: "", title: "", avatar: "" } },
    }
  }
  const next = ic.curriculum.flatMap(m => m.lessons).find(l => !e.completed.includes(l.id))
  return {
    courseId: e.courseId, enrolledAt: e.enrolledAt, progress: progressOf(e.courseId, e.completed), completedLessonIds: e.completed,
    source: e.source, nextLesson: next ? { id: next.id, title: next.title } : null, course: toInstructorCourse(ic),
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
/**
 * Mock Google sign-in. Real backend must verify the ID token with Google.
 * Mock accepts:
 *  - idToken === "mock-google-student" | "mock-google-instructor" → fixed demo accounts
 *  - any other non-empty idToken → create/link account
 */
route("POST", "/auth/google", { auth: false }, ({ db, body }) => {
  const idToken = String(body?.idToken ?? "").trim()
  if (!idToken) throw new ApiError(422, "Missing Google credential.", "VALIDATION", { idToken: "Required" })

  if (idToken === "mock-google-student" || idToken === "mock-google-instructor") {
    const email = idToken === "mock-google-instructor" ? "instructor@devora.et" : "student@devora.et"
    const user = db.users.find(u => u.email === email)
    if (!user) throw new ApiError(500, "Demo Google account missing from seed.")
    if (user.status === "suspended") throw new ApiError(403, "This account is suspended. Contact support.", "SUSPENDED")
    return { user: toProfile(user), token: `mock.${user.id}` } satisfies AuthResponse
  }

  let email = ""
  let name = "Google User"
  if (idToken.startsWith("google:")) {
    const parts = idToken.split(":")
    email = (parts[1] ?? "").toLowerCase()
    name = decodeURIComponent(parts[2] ?? "Google User")
  } else {
    email = `google.${idToken.slice(0, 12).replace(/[^a-z0-9]/gi, "")}@users.noreply.devora.et`.toLowerCase()
  }
  if (!email.includes("@")) throw new ApiError(400, "Invalid Google credential.", "INVALID_TOKEN")

  let user = db.users.find(u => u.email === email)
  if (!user) {
    const role: Role = body?.role === "instructor" ? "instructor" : "student"
    user = {
      id: uid("u"),
      name: name.trim() || "Google User",
      email,
      password: "",
      role,
      createdAt: new Date().toISOString(),
      status: "active",
      weeklyReminder: false,
      weeklyGoal: 5,
    }
    db.users.push(user)
    notify(db, user.id, { title: "Welcome to Devora", body: "You signed in with Google. Browse the catalog to start learning.", type: "system", link: "/courses" })
  }
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
  if (body?.locale === "en" || body?.locale === "am" || body?.locale === "om") u.locale = body.locale
  return toProfile(u)
})

/* ---------------- public catalog ---------------- */
route("GET", "/categories", { auth: false }, () => categories)
route("GET", "/courses", { auth: false }, ({ db, query }) => {
  const q = query as CourseQuery
  // Seed catalog + published instructor-created courses
  const publishedInstructor = db.instructorCourses.filter(c => c.status === "published")
  type Row = CourseSummary
  let list: Row[] = [
    ...seedCourses.map(toSummary),
    ...publishedInstructor.map(toInstructorCourse),
  ]
  if (q.search) {
    const s = String(q.search).toLowerCase()
    list = list.filter(c => c.title.toLowerCase().includes(s) || c.category.toLowerCase().includes(s) || c.tags.some(t => t.toLowerCase().includes(s)))
  }
  if (q.category) list = list.filter(c => c.category === q.category)
  if (q.level) list = list.filter(c => c.level === q.level)
  if (q.price === "free") list = list.filter(c => c.price === 0)
  if (q.price === "paid") list = list.filter(c => c.price > 0)
  if (String(q.featured) === "true") list = list.filter(c => c.featured)
  const sorters: Record<string, (a: Row, b: Row) => number> = {
    popular: (a, b) => b.students - a.students,
    rating: (a, b) => b.rating - a.rating,
    newest: (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
    "price-low": (a, b) => a.price - b.price,
    "price-high": (a, b) => b.price - a.price,
  }
  list.sort(sorters[q.sort ?? "popular"] ?? sorters.popular)
  const page = Number(q.page ?? 1), limit = Number(q.limit ?? 50)
  return { items: list.slice((page - 1) * limit, page * limit), total: list.length, page, limit } satisfies Paginated<CourseSummary>
})
route("GET", "/courses/([^/]+)", { auth: false }, ({ db, params }) => {
  const seed = seedCourses.find(x => x.id === params[0])
  if (seed) return toDetail(seed)
  const ic = db.instructorCourses.find(x => x.id === params[0] && x.status === "published")
  if (!ic) throw new ApiError(404, "Course not found.", "NOT_FOUND")
  const summary = toInstructorCourse(ic)
  return {
    ...summary,
    description: ic.description,
    language: ic.language,
    whatYouLearn: ic.whatYouLearn,
    prerequisites: ic.prerequisites,
    instructor: {
      ...summary.instructor,
      bio: "Course instructor on Devora.",
      courses: db.instructorCourses.filter(c => c.ownerId === ic.ownerId && c.status === "published").length,
      students: ic.students,
      rating: ic.rating || 5,
    },
    curriculum: ic.curriculum.map(m => ({
      id: m.id,
      title: m.title,
      lessons: m.lessons.map(l => ({ id: l.id, title: l.title, duration: l.duration, type: l.type, preview: l.preview })),
    })),
  } satisfies CourseDetail
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
  const seed = seedCourses.find(x => x.id === params[0])
  const ic = db.instructorCourses.find(x => x.id === params[0] && x.status === "published")
  if (!seed && !ic) throw new ApiError(404, "Course not found.", "NOT_FOUND")
  const price = seed ? seed.price : ic!.price
  const courseId = seed ? seed.id : ic!.id
  if (price > 0) throw new ApiError(403, "This course is paid. Complete checkout to enroll.", "PAYMENT_REQUIRED")
  let e = db.enrollments.find(x => x.userId === u.id && x.courseId === courseId)
  if (!e) {
    e = { userId: u.id, courseId, enrolledAt: new Date().toISOString(), completed: [], source: "free" }
    db.enrollments.push(e)
  }
  return toEnrollment(e)
})
function findLesson(courseId: string, lessonId: string) {
  const seed = seedCourses.find(x => x.id === courseId)
  if (seed) {
    const lesson = seed.curriculum.flatMap(m => m.lessons).find(l => l.id === lessonId)
    if (!lesson) throw new ApiError(404, "Lesson not found.", "NOT_FOUND")
    return { kind: "seed" as const, c: seed, lesson }
  }
  const ic = load().instructorCourses.find(x => x.id === courseId && x.status === "published")
  if (ic) {
    const lesson = ic.curriculum.flatMap(m => m.lessons).find(l => l.id === lessonId)
    if (!lesson) throw new ApiError(404, "Lesson not found.", "NOT_FOUND")
    return { kind: "instructor" as const, c: ic, lesson }
  }
  throw new ApiError(404, "Lesson not found.", "NOT_FOUND")
}
route("GET", "/courses/([^/]+)/lessons/([^/]+)", { auth: false }, ({ db, user, params }) => {
  const found = findLesson(params[0], params[1])
  const lesson = found.lesson
  const enrolled = user && db.enrollments.some(e => e.userId === user.id && e.courseId === params[0])
  if (!lesson.preview) {
    if (!user) throw new ApiError(401, "Sign in to continue.")
    if (!enrolled) throw new ApiError(403, "Enroll in this course to open this lesson.", "NOT_ENROLLED")
  }
  if (found.kind === "instructor") {
    const q = "quiz" in lesson ? lesson.quiz : undefined
    return {
      id: lesson.id, courseId: params[0], title: lesson.title,
      body: ("body" in lesson && lesson.body) ? lesson.body : "Lesson content will appear here.",
      videoUrl: "videoUrl" in lesson ? lesson.videoUrl : undefined,
      keyTakeaways: [],
      quiz: q?.map((qq, i) => ({ id: qq.id || `${lesson.id}-q${i}`, question: qq.question, options: qq.options })),
    } satisfies LessonContent
  }
  const seed = lessonContents[lesson.id]
  return {
    id: lesson.id, courseId: params[0], title: lesson.title,
    body: seed?.body ?? "Lesson content will appear here.",
    codeSnippet: seed?.codeSnippet, language: seed?.language, exercises: seed?.exercises,
    explanations: seed?.explanations,
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
  const seed = seedCourses.find(c => c.id === params[0])
  const ic = db.instructorCourses.find(c => c.id === params[0])
  const title = seed?.title ?? ic?.title ?? "Course"
  if (progressOf(e.courseId, e.completed) >= 100 && !db.certificates.some(c => c.userId === u.id && c.courseId === e.courseId)) {
    db.certificates.push({
      id: uid("cert"), userId: u.id, courseId: e.courseId, courseTitle: title, studentName: u.name,
      issuedAt: new Date().toISOString(), credentialId: `DEV-${e.courseId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
    })
    notify(db, u.id, { title: "Certificate earned", body: `You completed ${title}.`, type: "certificate", link: "/certificates" })
  }
  return toEnrollment(e)
})
route("POST", "/courses/([^/]+)/lessons/([^/]+)/quiz", {}, ({ db, user, params, body }) => {
  const u = need(user)
  const found = findLesson(params[0], params[1])
  const lesson = found.lesson
  if (!db.enrollments.some(e => e.userId === u.id && e.courseId === params[0])) throw new ApiError(403, "Enroll in this course first.", "NOT_ENROLLED")
  const quiz = found.kind === "instructor" && "quiz" in lesson && lesson.quiz
    ? lesson.quiz
    : lessonContents[lesson.id]?.quiz
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
  const courseId = String(body?.courseId ?? "")
  const lessonId = String(body?.lessonId ?? "")
  const last = [...((body?.messages ?? []) as TutorMessage[])].reverse().find(m => m.role === "user")
  // Dedicated tutor page uses courseId/lessonId "general" — no enrollment required.
  if (courseId === "general" || lessonId === "general") {
    return { reply: tutorReply(last?.text ?? "", { title: "general study help", takeaway: "breaking problems into smaller steps" }) }
  }
  const { lesson } = findLesson(courseId, lessonId)
  return { reply: tutorReply(last?.text ?? "", { title: lesson.title, takeaway: lessonContents[lesson.id]?.keyTakeaways?.[0] ?? "the core idea of this lesson" }) }
})

/* ---------------- payments ---------------- */
const stripPayment = ({ userId: _u, providerStatus: _p, ...p }: DbPayment): Payment => p
route("POST", "/payments/chapa/initialize", {}, ({ db, user, body }) => {
  const u = need(user)
  const seed = seedCourses.find(c => c.id === body?.courseId)
  const ic = db.instructorCourses.find(c => c.id === body?.courseId && c.status === "published")
  if (!seed && !ic) throw new ApiError(404, "Course not found.", "NOT_FOUND")
  const course = seed ?? ic!
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

function toInstructorCourse(c: DbInstructorCourse): import("../types").InstructorCourse {
  const lessonCount = c.curriculum.reduce((n, m) => n + m.lessons.length, 0)
  const durationMins = c.curriculum.reduce((n, m) => n + m.lessons.reduce((a, l) => {
    const parts = String(l.duration).split(":").map(Number)
    return a + (parts.length === 2 ? parts[0] * 60 + parts[1] : Number(l.duration) || 0)
  }, 0), 0)
  const hours = Math.max(1, Math.round(durationMins / 60))
  const owner = load().users.find(u => u.id === c.ownerId)
  return {
    id: c.id,
    title: c.title,
    subtitle: c.subtitle,
    category: c.category,
    level: c.level,
    price: c.price,
    originalPrice: c.originalPrice,
    rating: c.rating,
    reviews: c.reviews,
    students: c.students,
    duration: `${hours}h`,
    lessons: lessonCount,
    image: c.image,
    tags: c.tags,
    featured: c.featured,
    popular: c.popular,
    lastUpdated: c.lastUpdated,
    instructor: {
      id: c.ownerId,
      name: owner?.name ?? "Instructor",
      title: "Instructor",
      avatar: initials(owner?.name ?? "IN"),
    },
    status: c.status,
    rejectionReason: c.rejectionReason,
  }
}

function assignCurriculumIds(curriculum: any[]): DbInstructorCourse["curriculum"] {
  return (curriculum ?? []).map((m: any, mi: number) => ({
    id: m.id || uid("mod"),
    title: String(m.title ?? `Module ${mi + 1}`).trim() || `Module ${mi + 1}`,
    lessons: (m.lessons ?? []).map((l: any, li: number) => ({
      id: l.id || uid("les"),
      title: String(l.title ?? `Lesson ${li + 1}`).trim() || `Lesson ${li + 1}`,
      duration: String(l.duration ?? "10:00"),
      type: (["video", "quiz", "project", "reading"].includes(l.type) ? l.type : "video") as LessonType,
      preview: !!l.preview,
      body: l.body ? String(l.body) : undefined,
      videoUrl: l.videoUrl ? String(l.videoUrl) : undefined,
      quiz: Array.isArray(l.quiz) ? l.quiz.map((q: any, qi: number) => ({
        id: q.id || uid("q"),
        question: String(q.question ?? ""),
        options: Array.isArray(q.options) ? q.options.map(String) : ["A", "B", "C", "D"],
        correct: Number(q.correct ?? 0),
      })) : undefined,
    })),
  }))
}

function validateCourseInput(body: any) {
  const fields: Record<string, string> = {}
  if (String(body?.title ?? "").trim().length < 3) fields.title = "Title must be at least 3 characters"
  if (String(body?.subtitle ?? "").trim().length < 3) fields.subtitle = "Subtitle is required"
  if (String(body?.description ?? "").trim().length < 20) fields.description = "Description must be at least 20 characters"
  if (!body?.category) fields.category = "Pick a category"
  if (!["Beginner", "Intermediate", "Advanced"].includes(body?.level)) fields.level = "Pick a level"
  if (typeof body?.price !== "number" || body.price < 0 || !Number.isFinite(body.price)) fields.price = "Price must be 0 or a positive ETB amount"
  if (!(body?.curriculum?.length > 0)) fields.curriculum = "Add at least one module"
  else if (!body.curriculum.some((m: any) => m.lessons?.length > 0)) fields.curriculum = "Add at least one lesson"
  if (Object.keys(fields).length) throw new ApiError(422, "Please fix the highlighted fields.", "VALIDATION", fields)
}

route("GET", "/instructor/stats", { roles: ["instructor", "admin"] }, ({ db, user }) => {
  const u = need(user)
  const mine = db.instructorCourses.filter(c => c.ownerId === u.id || u.role === "admin")
  const publishedIds = new Set(mine.filter(c => c.status === "published").map(c => c.id))
  const enrollments = db.enrollments.filter(e => publishedIds.has(e.courseId) || seedCourses.some(s => s.id === e.courseId))
  // Keep seed stats as baseline for demo instructor; merge live data lightly
  return {
    totalRevenueEtb: instructorStats.totalRevenue * 57 + db.payments.filter(p => p.accessGranted && publishedIds.has(p.courseId)).reduce((s, p) => s + p.amountEtb, 0),
    activeStudents: instructorStats.activeStudents + new Set(enrollments.map(e => e.userId)).size,
    avgRating: instructorStats.avgRating,
    monthlyGrowthPct: instructorStats.monthlyGrowth,
    revenueByMonth: instructorStats.revenueByMonth.map(v => v * 57),
    enrollmentByMonth: instructorStats.enrollmentByMonth,
    topCourses: instructorStats.topCourses.map(t => ({
      courseId: t.id,
      title: seedCourses.find(c => c.id === t.id)?.title ?? t.id,
      enrollments: t.enrollments,
      revenueEtb: t.revenue * 57,
    })),
  }
})

route("GET", "/instructor/courses", { roles: ["instructor", "admin"] }, ({ db, user }) => {
  const u = need(user)
  return db.instructorCourses
    .filter(c => u.role === "admin" || c.ownerId === u.id)
    .map(toInstructorCourse)
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
})

route("GET", "/instructor/courses/([^/]+)", { roles: ["instructor", "admin"] }, ({ db, user, params }) => {
  const u = need(user)
  const c = db.instructorCourses.find(x => x.id === params[0])
  if (!c) throw new ApiError(404, "Course not found.", "NOT_FOUND")
  if (u.role !== "admin" && c.ownerId !== u.id) throw new ApiError(403, "Not your course.", "FORBIDDEN")
  return {
    ...toInstructorCourse(c),
    description: c.description,
    language: c.language,
    whatYouLearn: c.whatYouLearn,
    prerequisites: c.prerequisites,
    curriculum: c.curriculum.map(m => ({
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
    })),
  }
})

route("POST", "/instructor/courses", { roles: ["instructor", "admin"] }, ({ db, user, body }) => {
  const u = need(user)
  validateCourseInput(body)
  const now = new Date().toISOString()
  const course: DbInstructorCourse = {
    ownerId: u.id,
    status: "draft",
    id: uid("crs"),
    title: String(body.title).trim(),
    subtitle: String(body.subtitle).trim(),
    description: String(body.description).trim(),
    category: String(body.category),
    level: body.level,
    price: Math.round(Number(body.price)),
    originalPrice: Math.round(Number(body.price)),
    language: String(body.language ?? "English"),
    tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
    whatYouLearn: Array.isArray(body.whatYouLearn) ? body.whatYouLearn.map(String).filter(Boolean) : [],
    prerequisites: Array.isArray(body.prerequisites) ? body.prerequisites.map(String).filter(Boolean) : [],
    curriculum: assignCurriculumIds(body.curriculum),
    createdAt: now,
    lastUpdated: now,
    rating: 0,
    reviews: 0,
    students: 0,
    featured: false,
    popular: false,
    image: "gradient",
  }
  db.instructorCourses.unshift(course)
  return toInstructorCourse(course)
})

route("PUT", "/instructor/courses/([^/]+)", { roles: ["instructor", "admin"] }, ({ db, user, params, body }) => {
  const u = need(user)
  const c = db.instructorCourses.find(x => x.id === params[0])
  if (!c) throw new ApiError(404, "Course not found.", "NOT_FOUND")
  if (u.role !== "admin" && c.ownerId !== u.id) throw new ApiError(403, "Not your course.", "FORBIDDEN")
  if (c.status === "pending_review") throw new ApiError(409, "Course is under review. Unpublish to edit.", "UNDER_REVIEW")
  validateCourseInput(body)
  c.title = String(body.title).trim()
  c.subtitle = String(body.subtitle).trim()
  c.description = String(body.description).trim()
  c.category = String(body.category)
  c.level = body.level
  c.price = Math.round(Number(body.price))
  c.originalPrice = c.price
  c.language = String(body.language ?? c.language)
  c.tags = Array.isArray(body.tags) ? body.tags.map(String) : c.tags
  c.whatYouLearn = Array.isArray(body.whatYouLearn) ? body.whatYouLearn.map(String).filter(Boolean) : c.whatYouLearn
  c.prerequisites = Array.isArray(body.prerequisites) ? body.prerequisites.map(String).filter(Boolean) : c.prerequisites
  c.curriculum = assignCurriculumIds(body.curriculum)
  c.lastUpdated = new Date().toISOString()
  if (c.status === "published") c.status = "draft" // edits require re-submit
  return toInstructorCourse(c)
})

route("POST", "/instructor/courses/([^/]+)/submit", { roles: ["instructor", "admin"] }, ({ db, user, params }) => {
  const u = need(user)
  const c = db.instructorCourses.find(x => x.id === params[0])
  if (!c) throw new ApiError(404, "Course not found.", "NOT_FOUND")
  if (u.role !== "admin" && c.ownerId !== u.id) throw new ApiError(403, "Not your course.", "FORBIDDEN")
  if (c.status !== "draft" && c.status !== "rejected") throw new ApiError(409, "Only draft or rejected courses can be submitted.", "INVALID_STATUS")
  if (!c.curriculum.some(m => m.lessons.length > 0)) throw new ApiError(422, "Add lessons before submitting.", "VALIDATION", { curriculum: "Add at least one lesson" })
  c.status = "pending_review"
  c.rejectionReason = undefined
  c.lastUpdated = new Date().toISOString()
  notify(db, u.id, { title: "Course submitted", body: `"${c.title}" is awaiting admin review.`, type: "system", link: `/instructor?tab=courses` })
  return toInstructorCourse(c)
})

route("POST", "/instructor/courses/([^/]+)/unpublish", { roles: ["instructor", "admin"] }, ({ db, user, params }) => {
  const u = need(user)
  const c = db.instructorCourses.find(x => x.id === params[0])
  if (!c) throw new ApiError(404, "Course not found.", "NOT_FOUND")
  if (u.role !== "admin" && c.ownerId !== u.id) throw new ApiError(403, "Not your course.", "FORBIDDEN")
  c.status = "draft"
  c.lastUpdated = new Date().toISOString()
  return toInstructorCourse(c)
})

route("GET", "/instructor/students", { roles: ["instructor", "admin"] }, ({ db, user }) => {
  const u = need(user)
  const mine = new Set(db.instructorCourses.filter(c => c.ownerId === u.id || u.role === "admin").map(c => c.id))
  return db.enrollments
    .filter(e => mine.has(e.courseId))
    .map(e => {
      const student = db.users.find(x => x.id === e.userId)
      const course = db.instructorCourses.find(c => c.id === e.courseId)
      return {
        userId: e.userId,
        name: student?.name ?? "Student",
        email: student?.email ?? "",
        courseId: e.courseId,
        courseTitle: course?.title ?? e.courseId,
        enrolledAt: e.enrolledAt,
        progress: progressOfInstructor(course, e.completed),
      }
    })
})

route("GET", "/instructor/revenue", { roles: ["instructor", "admin"] }, ({ db, user }) => {
  const u = need(user)
  const mine = new Set(db.instructorCourses.filter(c => c.ownerId === u.id || u.role === "admin").map(c => c.id))
  return db.payments
    .filter(p => p.accessGranted && mine.has(p.courseId))
    .map(p => ({ txRef: p.txRef, courseTitle: p.courseTitle, amountEtb: p.amountEtb, paidAt: p.paidAt ?? p.createdAt }))
})

function progressOfInstructor(course: DbInstructorCourse | undefined, done: string[]) {
  const total = course?.curriculum.reduce((n, m) => n + m.lessons.length, 0) ?? 1
  return Math.min(100, Math.round((done.length / Math.max(1, total)) * 100))
}



/* ---------------- admin ---------------- */

function audit(db: Db, actor: DbUser, action: string, targetType: AdminAuditEntry["targetType"], targetId: string, detail: string) {
  db.auditLog.unshift({
    id: uid("aud"),
    actorId: actor.id,
    actorName: actor.name,
    action,
    targetType,
    targetId,
    detail,
    createdAt: new Date().toISOString(),
  })
}

function toPending(c: DbInstructorCourse, db: Db): AdminPendingCourse {
  const owner = db.users.find(u => u.id === c.ownerId)
  return {
    id: c.id,
    title: c.title,
    subtitle: c.subtitle,
    instructorName: owner?.name ?? "Unknown",
    instructorId: c.ownerId,
    price: c.price,
    level: c.level,
    status: c.status,
    submittedAt: c.lastUpdated,
    rejectionReason: c.rejectionReason,
  }
}

route("GET", "/admin/overview", { roles: ["admin"] }, ({ db }) => {
  const overview: AdminOverview = {
    users: db.users.length,
    instructors: db.users.filter(u => u.role === "instructor").length,
    courses: seedCourses.length + db.instructorCourses.filter(c => c.status === "published").length,
    pendingCourses: db.instructorCourses.filter(c => c.status === "pending_review").length,
    revenueEtb: db.payments.filter(p => p.accessGranted).reduce((s, p) => s + p.amountEtb, 0),
    transactions: db.payments.length,
    openTickets: db.tickets.filter(t => t.status === "open").length,
  }
  return overview
})

route("GET", "/admin/users", { roles: ["admin"] }, ({ db, query }) => {
  let list = [...db.users]
  const search = String(query.search ?? "").toLowerCase()
  if (search) list = list.filter(u => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search))
  if (query.role) list = list.filter(u => u.role === query.role)
  if (query.status) list = list.filter(u => u.status === query.status)
  return list.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt,
    coursesOwned: db.instructorCourses.filter(c => c.ownerId === u.id).length,
  }) satisfies AdminUserRow)
})

route("POST", "/admin/users/([^/]+)/status", { roles: ["admin"] }, ({ db, user, params, body }) => {
  const admin = need(user)
  const target = db.users.find(u => u.id === params[0])
  if (!target) throw new ApiError(404, "User not found.", "NOT_FOUND")
  if (target.role === "admin") throw new ApiError(403, "Cannot change admin status here.", "FORBIDDEN")
  const status = body?.status === "suspended" ? "suspended" : "active"
  target.status = status
  audit(db, admin, status === "suspended" ? "user.suspend" : "user.activate", "user", target.id, `${target.email} → ${status}`)
  return { id: target.id, name: target.name, email: target.email, role: target.role, status: target.status, createdAt: target.createdAt } satisfies AdminUserRow
})

route("POST", "/admin/users/([^/]+)/role", { roles: ["admin"] }, ({ db, user, params, body }) => {
  const admin = need(user)
  const target = db.users.find(u => u.id === params[0])
  if (!target) throw new ApiError(404, "User not found.", "NOT_FOUND")
  if (target.role === "admin") throw new ApiError(403, "Cannot change admin role.", "FORBIDDEN")
  const role = body?.role === "instructor" ? "instructor" : "student"
  const prev = target.role
  target.role = role
  audit(db, admin, "user.role", "user", target.id, `${target.email}: ${prev} → ${role}`)
  return { id: target.id, name: target.name, email: target.email, role: target.role, status: target.status, createdAt: target.createdAt } satisfies AdminUserRow
})

route("GET", "/admin/courses/pending", { roles: ["admin"] }, ({ db }) =>
  db.instructorCourses.filter(c => c.status === "pending_review").map(c => toPending(c, db))
)

route("GET", "/admin/courses", { roles: ["admin"] }, ({ db }) =>
  db.instructorCourses.map(c => toPending(c, db)).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
)

route("POST", "/admin/courses/([^/]+)/approve", { roles: ["admin"] }, ({ db, user, params }) => {
  const admin = need(user)
  const c = db.instructorCourses.find(x => x.id === params[0])
  if (!c) throw new ApiError(404, "Course not found.", "NOT_FOUND")
  c.status = "published"
  c.rejectionReason = undefined
  c.lastUpdated = new Date().toISOString()
  audit(db, admin, "course.approve", "course", c.id, c.title)
  notify(db, c.ownerId, { title: "Course approved", body: `"${c.title}" is now live in the catalog.`, type: "system", link: `/courses/${c.id}` })
  return toPending(c, db)
})

route("POST", "/admin/courses/([^/]+)/reject", { roles: ["admin"] }, ({ db, user, params, body }) => {
  const admin = need(user)
  const c = db.instructorCourses.find(x => x.id === params[0])
  if (!c) throw new ApiError(404, "Course not found.", "NOT_FOUND")
  const reason = String(body?.reason ?? "").trim() || "Does not meet platform standards"
  c.status = "rejected"
  c.rejectionReason = reason
  c.lastUpdated = new Date().toISOString()
  audit(db, admin, "course.reject", "course", c.id, `${c.title}: ${reason}`)
  notify(db, c.ownerId, { title: "Course rejected", body: `"${c.title}" was rejected. ${reason}`, type: "system", link: "/instructor?tab=courses" })
  return toPending(c, db)
})

route("GET", "/admin/transactions", { roles: ["admin"] }, ({ db }) =>
  db.payments.map(p => ({
    txRef: p.txRef,
    courseTitle: p.courseTitle,
    amountEtb: p.amountEtb,
    status: p.status,
    accessGranted: p.accessGranted,
    buyerName: p.buyerName,
    email: p.email,
    createdAt: p.createdAt,
    paidAt: p.paidAt,
  }) satisfies AdminTransaction)
)

route("GET", "/admin/reports", { roles: ["admin"] }, ({ db }) => {
  if (db.reports.length === 0) {
    // seed a sample open report for demo
    db.reports.push({
      id: uid("rep"),
      type: "course",
      targetId: "crs1",
      reason: "Sample report: outdated content mentioned by a student.",
      status: "open",
      createdAt: new Date().toISOString(),
    })
  }
  return db.reports
})

route("POST", "/admin/reports/([^/]+)", { roles: ["admin"] }, ({ db, user, params, body }) => {
  const admin = need(user)
  const r = db.reports.find(x => x.id === params[0])
  if (!r) throw new ApiError(404, "Report not found.", "NOT_FOUND")
  r.status = body?.status === "actioned" ? "actioned" : "dismissed"
  audit(db, admin, `report.${r.status}`, "report", r.id, r.reason.slice(0, 80))
  return r
})

route("GET", "/admin/tickets", { roles: ["admin"] }, ({ db }) => {
  if (db.tickets.length === 0) {
    db.tickets.push({
      id: uid("tkt"),
      subject: "Payment not unlocking course",
      message: "I paid with Chapa but still cannot open the lessons.",
      email: "student@devora.et",
      status: "open",
      createdAt: new Date().toISOString(),
    })
  }
  return db.tickets
})

route("POST", "/admin/tickets/([^/]+)/resolve", { roles: ["admin"] }, ({ db, user, params }) => {
  const admin = need(user)
  const tkt = db.tickets.find(x => x.id === params[0])
  if (!tkt) throw new ApiError(404, "Ticket not found.", "NOT_FOUND")
  tkt.status = "resolved"
  audit(db, admin, "ticket.resolve", "system", tkt.id, tkt.subject)
  return tkt
})

route("GET", "/admin/audit", { roles: ["admin"] }, ({ db }) => db.auditLog)

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
