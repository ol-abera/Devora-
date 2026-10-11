/**
 * API contract types. These are the exact JSON shapes the Express backend must return/accept.
 * Conventions (see docs/API_CONTRACT.md):
 *  - all ids are strings (UUIDs from PostgreSQL)
 *  - all timestamps are ISO-8601 strings (timestamptz)
 *  - all money is ETB, sent as a whole number (e.g. 12490). 0 = free course
 *  - responses are camelCase JSON
 */

export type Role = "student" | "instructor" | "admin"
export type CourseLevel = "Beginner" | "Intermediate" | "Advanced"
export type CourseStatus = "draft" | "pending_review" | "published" | "rejected" | "archived"
export type LessonType = "video" | "quiz" | "project" | "reading"

export interface User {
  id: string
  name: string
  email: string
  role: Role
  avatar: string // initials, or an image URL
  createdAt: string
  status: "active" | "suspended" | "pending"
}

export interface AuthResponse {
  user: Profile
  token: string // JWT, sent back as "Authorization: Bearer <token>"
}

export interface InstructorSummary {
  id: string
  name: string
  title: string
  avatar: string
  bio: string
  courses: number
  students: number
  rating: number
}

export interface Lesson {
  id: string
  title: string
  duration: string // "18:42"
  type: LessonType
  preview: boolean // free preview lesson
}

export interface CurriculumModule {
  id: string
  title: string
  lessons: Lesson[]
}

/** Card/list shape: GET /courses */
export interface CourseSummary {
  id: string
  title: string
  subtitle: string
  category: string
  level: CourseLevel
  price: number
  originalPrice: number
  rating: number
  reviews: number
  students: number
  duration: string
  lessons: number
  image: string
  tags: string[]
  featured: boolean
  popular: boolean
  lastUpdated: string
  instructor: Pick<InstructorSummary, "id" | "name" | "title" | "avatar">
}

/** Detail shape: GET /courses/:id */
export interface CourseDetail extends CourseSummary {
  description: string
  language: string
  whatYouLearn: string[]
  prerequisites: string[]
  instructor: InstructorSummary
  curriculum: CurriculumModule[]
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export interface CourseQuery {
  search?: string
  category?: string
  level?: CourseLevel
  price?: "free" | "paid"
  sort?: "popular" | "rating" | "newest" | "price-low" | "price-high"
  featured?: boolean
  page?: number
  limit?: number
}

export interface Category {
  id: string
  name: string
  icon: string
  courseCount: number
  color: string
}

export interface Review {
  id: string
  courseId: string
  author: string
  avatar: string
  rating: number // 1-5
  comment: string
  createdAt: string
}

export interface Enrollment {
  courseId: string
  enrolledAt: string
  progress: number // 0-100, computed by the server
  completedLessonIds: string[]
  source: "free" | "payment"
  nextLesson: { id: string; title: string } | null // first lesson not completed yet, null when all done
  course: CourseSummary
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[] // NEVER include the correct answer here
}

export interface LessonContent {
  id: string
  courseId: string
  title: string
  body: string
  videoUrl?: string
  codeSnippet?: string
  language?: string
  /** Optional short explanations / subtitles in local languages (English body remains primary). */
  explanations?: {
    am?: string // Amharic
    om?: string // Afaan Oromo
  }
  quiz?: QuizQuestion[]
  exercises?: string[]
  keyTakeaways: string[]
}

export interface QuizSubmission {
  answers: number[] // option index per question, same order as the quiz
}

export interface QuizResult {
  score: number
  total: number
  passed: boolean // server decides the pass mark
  correctAnswers: number[]
  attemptedAt: string
}

export interface Certificate {
  id: string
  courseId: string
  courseTitle: string
  studentName: string
  issuedAt: string
  credentialId: string // public, used for verification
}

export interface CertificateVerification {
  valid: boolean
  certificate?: Certificate
}

export type PaymentStatus = "pending" | "success" | "failed" | "cancelled"

/** One purchase. Only the server decides accessGranted (after verifying with Chapa). */
export interface Payment {
  txRef: string
  courseId: string
  courseTitle: string
  amountEtb: number
  status: PaymentStatus
  accessGranted: boolean
  providerReference: string | null
  email: string
  phone: string
  buyerName: string
  createdAt: string
  paidAt: string | null
}

export interface ChapaInitRequest {
  courseId: string // price is looked up on the server, never sent by the client
  fullName: string
  email: string
  phone: string // +2519XXXXXXXX
}

export interface ChapaInitResponse {
  txRef: string
  checkoutUrl: string // Chapa hosted checkout. Browser is redirected here
}

export interface AppNotification {
  id: string
  title: string
  body: string
  type: "payment" | "course" | "certificate" | "system"
  read: boolean
  createdAt: string
  link?: string
}

export interface TutorMessage {
  role: "user" | "assistant"
  text: string
}

export interface PlaygroundChallenge {
  id: string
  title: string
  description: string
  starterHtml: string
  starterCss: string
  starterJs: string
  tests: { name: string; expected: string; check: string }[]
}

export interface UpdateProfileRequest {
  name?: string
  weeklyReminder?: boolean
  weeklyGoal?: number
  locale?: "en" | "am" | "om"
}

export interface Profile extends User {
  weeklyReminder: boolean
  weeklyGoal: number // lessons per week the student wants to finish
  lessonsThisWeek: number // lessons completed in the last 7 days (server computes this)
  /** UI language preference; synced from settings when the user is signed in. */
  locale?: "en" | "am" | "om"
}

/* ---------------- Instructor ---------------- */

export interface InstructorStats {
  totalRevenueEtb: number
  activeStudents: number
  avgRating: number
  monthlyGrowthPct: number
  revenueByMonth: number[] // 12 values, Jan..Dec of the current year
  enrollmentByMonth: number[]
  topCourses: { courseId: string; title: string; enrollments: number; revenueEtb: number }[]
}

export interface InstructorCourse extends CourseSummary {
  status: CourseStatus
  rejectionReason?: string
}

export interface LessonInput {
  id?: string // omit for new lessons
  title: string
  duration: string
  type: LessonType
  preview: boolean
  body?: string
  videoUrl?: string
  quiz?: { id?: string; question: string; options: string[]; correct: number }[]
}

export interface ModuleInput {
  id?: string
  title: string
  lessons: LessonInput[]
}

export interface CourseInput {
  title: string
  subtitle: string
  description: string
  category: string
  level: CourseLevel
  price: number
  language: string
  tags: string[]
  whatYouLearn: string[]
  prerequisites: string[]
  curriculum: ModuleInput[]
}

export interface InstructorStudent {
  userId: string
  name: string
  email: string
  courseId: string
  courseTitle: string
  enrolledAt: string
  progress: number
}

export interface InstructorRevenueRow {
  txRef: string
  courseTitle: string
  amountEtb: number
  paidAt: string
}

/* ---------------- Admin ---------------- */

export interface AdminOverview {
  users: number
  instructors: number
  courses: number
  pendingCourses: number
  revenueEtb: number
  transactions: number
  openTickets: number
}

export interface SupportTicket {
  id: string
  subject: string
  message: string
  email: string
  status: "open" | "resolved"
  createdAt: string
}

export interface AdminReport {
  id: string
  type: "review" | "course" | "user"
  targetId: string
  reason: string
  status: "open" | "dismissed" | "actioned"
  createdAt: string
}

export interface AdminUserRow {
  id: string
  name: string
  email: string
  role: Role
  status: "active" | "suspended" | "pending"
  createdAt: string
  coursesOwned?: number
}

export interface AdminTransaction {
  txRef: string
  courseTitle: string
  amountEtb: number
  status: PaymentStatus
  accessGranted: boolean
  buyerName: string
  email: string
  createdAt: string
  paidAt: string | null
}

export interface AdminAuditEntry {
  id: string
  actorId: string
  actorName: string
  action: string
  targetType: "user" | "course" | "payment" | "report" | "system"
  targetId: string
  detail: string
  createdAt: string
}

export interface AdminPendingCourse {
  id: string
  title: string
  subtitle: string
  instructorName: string
  instructorId: string
  price: number
  level: CourseLevel
  status: CourseStatus
  submittedAt: string
  rejectionReason?: string
}

