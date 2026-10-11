# Devora API contract (frontend ⇄ Express + PostgreSQL)

The frontend calls exactly these endpoints. Types are in `src/api/types.ts` (source of truth), calls are in `src/api/*.ts`.
While the backend is not ready, `VITE_USE_MOCK=true` runs a fake server in the browser that follows this same contract (`src/api/mock/mockServer.ts` is a working reference for the behaviour).

## Conventions
- Base URL: `VITE_API_URL` (default `/api`). Dev server proxies `/api/*` to `VITE_PROXY_TARGET` (default `http://localhost:4000`), so mount all routes under `/api` or change the env value.
- JSON only, camelCase keys, ids are strings (use UUIDs), timestamps are ISO-8601 strings.
- Money is ETB as a whole number (`12490`). `0` means free.
- Auth: `Authorization: Bearer <JWT>`. Login/register return `{ user, token }`. Any `401` signs the user out in the UI.
- Errors: HTTP status + body `{ "message": "Readable text", "code": "OPTIONAL", "fields": { "email": "Already used" } }`.
  `fields` (for 422/409) is shown under the matching form input. `message` is shown to the user as-is.
- Lists: `{ items, total, page, limit }`.
- CORS: only needed if you do not use the Vite proxy / same domain. Allow the frontend origin and the `Authorization` header.

## Auth
| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/auth/register` | `{ name, email, password(min 8), role: "student"\|"instructor" }` | `{ user: Profile, token }` (never allow `admin` here) |
| POST | `/auth/login` | `{ email, password }` | `{ user: Profile, token }`; 401 wrong credentials; 403 suspended |
| POST | `/auth/google` | `{ idToken, role?: "student"\|"instructor" }` | `{ user: Profile, token }`. Server **must** verify the Google ID token (aud, iss, exp, email_verified). Create account if email is new (default role student, or `role` if provided); link if email exists. Never trust client-only success. 400 INVALID_TOKEN; 403 suspended |
| POST | `/auth/logout` | – | 204 |
| GET | `/auth/me` | – | `Profile` |
| POST | `/auth/forgot-password` | `{ email }` | `{ message }`. Always the same answer, whether or not the email exists. Email a link to `{FRONTEND_URL}/reset-password?token=...` |
| POST | `/auth/reset-password` | `{ token, password }` | `{ message }`; 400 `INVALID_TOKEN` |
| PATCH | `/me` | `{ name?, weeklyReminder?, weeklyGoal?, locale?: "en"\|"am"\|"om" }` | `Profile` (includes optional `locale`) |

`Profile` = `User` + `weeklyReminder`, `weeklyGoal`, `lessonsThisWeek` (lessons completed in the last 7 days, computed in SQL).

## Public catalog
| Method | Path | Notes |
|---|---|---|
| GET | `/categories` | `Category[]` (`courseCount` = published courses) |
| GET | `/courses` | Query: `search, category, level, price=free\|paid, sort=popular\|rating\|newest\|price-low\|price-high, featured=true, page, limit`. Returns `Paginated<CourseSummary>`. Only `published` courses. |
| GET | `/courses/:courseId` | `CourseDetail` (curriculum lists titles/durations only, never lesson bodies) |
| GET | `/courses/:courseId/reviews` | `Paginated<Review>` |
| POST | `/courses/:courseId/reviews` | `{ rating 1-5, comment }`. Only enrolled students. One review per student. |
| GET | `/playground/challenges` | `PlaygroundChallenge[]` |
| GET | `/certificates/verify/:credentialId` | Public. `{ valid: boolean, certificate? }` |

## Student (token required)
| Method | Path | Notes |
|---|---|---|
| GET | `/me/enrollments` | `Enrollment[]` with `progress`, `completedLessonIds`, `nextLesson`, `course` |
| POST | `/courses/:courseId/enroll` | **Free courses only.** Paid course → 403 `PAYMENT_REQUIRED`. Returns `Enrollment` |
| GET | `/courses/:courseId/lessons/:lessonId` | `LessonContent`. Allowed if the lesson is `preview`, or the user is enrolled. Otherwise 401/403. **Never include quiz answers.** Optional `explanations: { am?, om? }` for local-language summaries; English `body` remains primary. |
| POST | `/courses/:courseId/lessons/:lessonId/complete` | Returns updated `Enrollment`. When progress hits 100: create the certificate + a notification |
| POST | `/courses/:courseId/lessons/:lessonId/quiz` | `{ answers: number[] }` → `QuizResult` (server grades; suggested pass mark 60%) |
| GET | `/me/bookmarks` | `CourseSummary[]` |
| PUT / DELETE | `/me/bookmarks/:courseId` | 204, idempotent |
| GET | `/me/certificates` | `Certificate[]` (credentialId must be unique and hard to guess) |
| GET | `/me/notifications` | `AppNotification[]`, newest first |
| POST | `/me/notifications/:id/read` · `/me/notifications/read-all` | 204 |
| GET | `/me/payments` | `Payment[]`, newest first |
| POST | `/ai-tutor/chat` | `{ courseId, lessonId, messages: [{role,text}] }` → `{ reply }`. Call your AI provider here; keep the key on the server. Require enrollment when `courseId`/`lessonId` are real lesson ids. Allow `courseId: "general"` / `lessonId: "general"` for the dedicated tutor page (signed-in users only). |

## Payments with Chapa (ETB)
1. `POST /payments/chapa/initialize` body `{ courseId, fullName, email, phone }` (phone is `+2519XXXXXXXX`).
   - **Look up the price in the database from `courseId`. The client never sends an amount.**
   - 404 unknown course · 400 `FREE_COURSE` · 409 `ALREADY_ENROLLED` · 422 with `fields` for bad input.
   - Create a `payments` row with status `pending` and a unique `txRef`. Call Chapa `transaction/initialize` with `tx_ref`, `amount`, `currency: "ETB"`, `return_url: {FRONTEND_URL}/payment/return?tx_ref={txRef}`, and `callback_url` pointing to your webhook.
   - Return `{ txRef, checkoutUrl }`. The browser goes to `checkoutUrl`.
2. Chapa webhook (`POST /payments/chapa/webhook`, not called by the frontend): verify the signature header, then verify the transaction with Chapa, then update the row. Must be idempotent.
3. `POST /payments/:txRef/verify` (called when the user lands on `/payment/return`; the UI repeats it every 4s up to 8 times while `pending`):
   - Only the owner of the payment. Call Chapa `transaction/verify/{txRef}`.
   - On success **in one DB transaction**: mark payment `success`, set `paidAt`, `providerReference`, create the enrollment (ignore if it already exists), add a notification.
   - Check that the Chapa amount and currency equal the stored amount. If not, mark `failed`.
   - Return the `Payment`. `accessGranted` is `true` only for a verified success.
4. `GET /payments/:txRef` returns one `Payment` (owner only) for receipts.

Statuses: `pending | success | failed | cancelled`. The UI never unlocks a course on its own. It relies on lesson-endpoint authorisation (step "lessons") plus `accessGranted`.

## Instructor (role `instructor` or `admin`)
| Method | Path | Notes |
|---|---|---|
| GET | `/instructor/stats` | `InstructorStats` (revenue in ETB; month arrays have 12 numbers, Jan–Dec of this year) |
| GET | `/instructor/courses` | `InstructorCourse[]` owned by the caller (admin may see all) |
| GET | `/instructor/courses/:id` | Full builder payload (description, curriculum with lesson bodies/quizzes) |
| POST | `/instructor/courses` | Body `CourseInput` → creates **draft** `InstructorCourse` |
| PUT | `/instructor/courses/:id` | Body `CourseInput` → update; published courses become draft after edit |
| POST | `/instructor/courses/:id/submit` | Submit draft/rejected for review. Mock auto-publishes; production should set `pending_review` until admin approves |
| POST | `/instructor/courses/:id/unpublish` | Back to `draft` |
| GET | `/instructor/students` | `InstructorStudent[]` for the instructor's courses |
| GET | `/instructor/revenue` | `InstructorRevenueRow[]` successful payments on the instructor's courses |

Published instructor courses must appear in the public `GET /courses` catalog. Lesson bodies for those courses come from the stored curriculum (not seed data).

## Admin (role `admin` only)
| Method | Path | Notes |
|---|---|---|
| GET | `/admin/overview` | `AdminOverview` |
| GET | `/admin/users` | Query optional `search`, `role`, `status` → `AdminUserRow[]` |
| POST | `/admin/users/:id/status` | `{ status: "active"\|"suspended" }` |
| POST | `/admin/users/:id/role` | `{ role: "student"\|"instructor" }` (never promote to admin via this) |
| GET | `/admin/courses/pending` | Courses with `pending_review` |
| GET | `/admin/courses` | All instructor-created courses |
| POST | `/admin/courses/:id/approve` | → `published` + notify owner |
| POST | `/admin/courses/:id/reject` | `{ reason }` → `rejected` |
| GET | `/admin/transactions` | `AdminTransaction[]` |
| GET | `/admin/reports` | `AdminReport[]` |
| POST | `/admin/reports/:id` | `{ status: "dismissed"\|"actioned" }` |
| GET | `/admin/tickets` | `SupportTicket[]` |
| POST | `/admin/tickets/:id/resolve` | → resolved |
| GET | `/admin/audit` | `AdminAuditEntry[]` newest first |

All admin mutations should append an audit entry.

## Suggested PostgreSQL tables
`users` (id, name, email unique, password_hash, role, status, weekly_goal, weekly_reminder, created_at) ·
`password_reset_tokens` · `categories` · `courses` (price_etb int, status, instructor_id, …) ·
`modules` · `lessons` (type, duration, is_preview, body, video_url) · `quiz_questions` (options jsonb, correct_index) ·
`enrollments` (user_id, course_id, source, enrolled_at, unique(user_id, course_id)) ·
`lesson_completions` (user_id, lesson_id, completed_at) · `quiz_attempts` ·
`bookmarks` · `reviews` · `payments` (tx_ref unique, amount_etb, status, provider_reference, paid_at) ·
`certificates` (credential_id unique) · `notifications`.

## Rules the backend must enforce (the frontend only hides things)
- Authorise every lesson/quiz/tutor request against enrollment (or `preview`).
- Never trust role, price, progress, or payment status sent by the browser.
- Hash passwords (bcrypt/argon2), rate-limit login and forgot-password, keep JWT secret and Chapa secret in env vars.
