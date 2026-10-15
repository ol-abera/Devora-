import { Router } from "express";
import { randomUUID } from "node:crypto";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();
const routeParam = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value[0] ?? "" : value ?? "";
type AuthUser = { userId: string; role: string };
const roleOut = (role: string) => role.toLowerCase();
const levelOut = (level: string) => level.charAt(0) + level.slice(1).toLowerCase();
const statusOut = (status: string) => status.toLowerCase();
const avatarFor = (name: string, avatar?: string | null) => avatar || name.split(/\s+/).filter(Boolean).slice(0, 2).map((x) => x[0]?.toUpperCase()).join("");

async function courseSummary(course: any) {
  const lessons = course.sections?.flatMap((s: any) => s.lessons ?? []) ?? [];
  const reviews = course.reviews ?? [];
  const students = course.enrollments?.length ?? 0;
  const rating = reviews.length ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length : 0;
  return {
    id: course.id, title: course.title, subtitle: course.subtitle, category: course.category,
    level: levelOut(course.level), price: course.price, originalPrice: course.originalPrice,
    rating: Math.round(rating * 10) / 10, reviews: reviews.length, students,
    duration: course.duration, lessons: lessons.length, image: course.thumbnailUrl || "",
    tags: course.tags, featured: course.featured, popular: course.popular, lastUpdated: course.updatedAt.toISOString(),
    instructor: { id: course.instructor.id, name: course.instructor.name, title: "Instructor", avatar: avatarFor(course.instructor.name, course.instructor.avatar) },
  };
}
const courseInclude = {
  instructor: { select: { id: true, name: true, avatar: true } },
  sections: { orderBy: { position: "asc" as const }, include: { lessons: { orderBy: { position: "asc" as const }, select: { id: true, title: true, duration: true, type: true, isFree: true, content: true, videoUrl: true, description: true, position: true } } } },
  reviews: { select: { rating: true } },
  enrollments: { where: { status: { in: ["ACTIVE", "COMPLETED"] as any } }, select: { id: true } },
};

// Public category list, derived from existing course.category values (no duplicate category table).
router.get("/categories", async (_req, res) => {
  try {
    const rows = await prisma.course.groupBy({ by: ["category"], where: { status: "PUBLISHED" }, _count: { _all: true }, orderBy: { category: "asc" } });
    const palette = ["blue", "violet", "green", "orange", "pink", "cyan"];
    return res.json(rows.map((r, i) => ({ id: r.category.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name: r.category, icon: "book-open", courseCount: r._count._all, color: palette[i % palette.length] })));
  } catch (e) { console.error("categories", e); return res.status(500).json({ message: "Unable to load categories." }); }
});

router.get("/courses", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const category = typeof req.query.category === "string" ? req.query.category.trim() : "";
    const level = typeof req.query.level === "string" ? req.query.level.toUpperCase() : "";
    const price = typeof req.query.price === "string" ? req.query.price : "";
    const sort = typeof req.query.sort === "string" ? req.query.sort : "newest";
    const featured = req.query.featured === "true";
    const where: any = { status: "PUBLISHED" };
    if (search) where.OR = ["title", "subtitle", "description", "category"].map((key) => ({ [key]: { contains: search, mode: "insensitive" } }));
    if (category) where.category = { equals: category, mode: "insensitive" };
    if (["BEGINNER", "INTERMEDIATE", "ADVANCED"].includes(level)) where.level = level;
    if (price === "free") where.price = 0;
    if (price === "paid") where.price = { gt: 0 };
    if (featured) where.featured = true;
    const orderBy: any = sort === "price-low" ? { price: "asc" } : sort === "price-high" ? { price: "desc" } : { createdAt: "desc" };
    const [total, courses] = await Promise.all([
      prisma.course.count({ where }),
      prisma.course.findMany({ where, include: courseInclude, orderBy, skip: (page - 1) * limit, take: limit }),
    ]);
    let items = await Promise.all(courses.map(courseSummary));
    if (sort === "popular") items = items.sort((a, b) => b.students - a.students);
    if (sort === "rating") items = items.sort((a, b) => b.rating - a.rating);
    return res.json({ items, total, page, limit });
  } catch (e) { console.error("course catalog", e); return res.status(500).json({ message: "Unable to load courses." }); }
});

router.get("/courses/:courseId", async (req, res) => {
  try {
    const key = routeParam(req.params.courseId);
    const course = await prisma.course.findFirst({ where: { status: "PUBLISHED", OR: [{ id: key }, { slug: key }] }, include: courseInclude });
    if (!course) return res.status(404).json({ message: "Course not found." });
    const summary = await courseSummary(course);
    const allReviews = await prisma.review.findMany({ where: { courseId: course.id }, select: { rating: true } });
    const students = await prisma.enrollment.count({ where: { courseId: course.id, status: { in: ["ACTIVE", "COMPLETED"] } } });
    const instructor = await prisma.user.findUnique({ where: { id: course.instructorId }, select: { id: true, name: true, avatar: true } });
    const curriculum = course.sections.map((section) => ({ id: section.id, title: section.title, lessons: section.lessons.map((lesson) => ({ id: lesson.id, title: lesson.title, duration: lesson.duration, type: lesson.type.toLowerCase(), preview: lesson.isFree })) }));
    const instructorSummary = { id: instructor!.id, name: instructor!.name, title: "Instructor", avatar: avatarFor(instructor!.name, instructor!.avatar), bio: "", courses: await prisma.course.count({ where: { instructorId: instructor!.id, status: "PUBLISHED" } }), students, rating: allReviews.length ? Math.round(allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length * 10) / 10 : 0 };
    return res.json({ ...summary, description: course.description, language: course.language, whatYouLearn: course.whatYouLearn, prerequisites: course.prerequisites, instructor: instructorSummary, curriculum });
  } catch (e) { console.error("course detail", e); return res.status(500).json({ message: "Unable to load course." }); }
});

router.get("/courses/:courseId/reviews", async (req, res) => {
  try {
    const courseId = routeParam(req.params.courseId);
    const page = Math.max(1, Number(req.query.page) || 1); const limit = 10;
    const course = await prisma.course.findFirst({ where: { OR: [{ id: courseId }, { slug: courseId }], status: "PUBLISHED" }, select: { id: true } });
    if (!course) return res.status(404).json({ message: "Course not found." });
    const [total, rows] = await Promise.all([prisma.review.count({ where: { courseId: course.id } }), prisma.review.findMany({ where: { courseId: course.id }, include: { user: { select: { name: true, avatar: true } } }, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit })]);
    return res.json({ items: rows.map((r) => ({ id: r.id, courseId: r.courseId, author: r.user.name, avatar: avatarFor(r.user.name, r.user.avatar), rating: r.rating, comment: r.comment, createdAt: r.createdAt.toISOString() })), total, page, limit });
  } catch (e) { console.error("course reviews", e); return res.status(500).json({ message: "Unable to load reviews." }); }
});
router.post("/courses/:courseId/reviews", requireAuth, async (req, res) => {
  const auth = res.locals.authUser as AuthUser; const rating = Number(req.body?.rating); const comment = typeof req.body?.comment === "string" ? req.body.comment.trim() : "";
  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !comment) return res.status(422).json({ message: "Provide a rating from 1 to 5 and a comment." });
  try {
    const course = await prisma.course.findFirst({ where: { OR: [{ id: routeParam(req.params.courseId) }, { slug: routeParam(req.params.courseId) }], status: "PUBLISHED" }, select: { id: true } });
    if (!course) return res.status(404).json({ message: "Course not found." });
    const enrollment = await prisma.enrollment.findUnique({ where: { studentId_courseId: { studentId: auth.userId, courseId: course.id } } });
    if (!enrollment || !["ACTIVE", "COMPLETED"].includes(enrollment.status)) return res.status(403).json({ message: "Enroll in this course before reviewing it." });
    const review = await prisma.review.upsert({ where: { userId_courseId: { userId: auth.userId, courseId: course.id } }, create: { userId: auth.userId, courseId: course.id, rating, comment }, update: { rating, comment }, include: { user: { select: { name: true, avatar: true } } } });
    return res.status(201).json({ id: review.id, courseId: review.courseId, author: review.user.name, avatar: avatarFor(review.user.name, review.user.avatar), rating: review.rating, comment: review.comment, createdAt: review.createdAt.toISOString() });
  } catch (e) { console.error("add review", e); return res.status(500).json({ message: "Unable to save review." }); }
});

router.post("/courses/:courseId/enroll", requireAuth, async (req, res) => {
  const auth = res.locals.authUser as AuthUser;
  try {
    const user = await prisma.user.findUnique({ where: { id: auth.userId }, select: { status: true } });
    if (!user || user.status !== "ACTIVE") return res.status(403).json({ message: "Your account must be active." });
    if (auth.role !== "STUDENT") return res.status(403).json({ message: "Only students can enroll." });
    const course = await prisma.course.findFirst({ where: { OR: [{ id: routeParam(req.params.courseId) }, { slug: routeParam(req.params.courseId) }], status: "PUBLISHED" }, select: { id: true, price: true } });
    if (!course) return res.status(404).json({ message: "Course not found." });
    if (course.price > 0) return res.status(403).json({ message: "Payment is required for this course.", code: "PAYMENT_REQUIRED" });
    const enrollment = await prisma.enrollment.upsert({ where: { studentId_courseId: { studentId: auth.userId, courseId: course.id } }, create: { studentId: auth.userId, courseId: course.id, source: "free" }, update: { status: "ACTIVE", source: "free" }, include: { course: { include: courseInclude } } });
    return res.status(200).json(await shapeEnrollment(enrollment, auth.userId));
  } catch (e) { console.error("enroll", e); return res.status(500).json({ message: "Unable to enroll in this course." }); }
});

async function shapeEnrollment(enrollment: any, userId: string) {
  const course = enrollment.course;
  const lessons = course.sections.flatMap((s: any) => s.lessons);
  const progress = lessons.length ? await prisma.lessonProgress.findMany({ where: { userId, lessonId: { in: lessons.map((l: any) => l.id) }, completed: true }, select: { lessonId: true } }) : [];
  const completed = new Set(progress.map((p) => p.lessonId));
  const summary = await courseSummary(course);
  const next = lessons.find((l: any) => !completed.has(l.id));
  return { courseId: course.id, enrolledAt: enrollment.enrolledAt.toISOString(), progress: lessons.length ? Math.round(completed.size / lessons.length * 100) : 0, completedLessonIds: [...completed], source: enrollment.source === "payment" ? "payment" : "free", nextLesson: next ? { id: next.id, title: next.title } : null, course: summary };
}
router.get("/me/enrollments", requireAuth, async (_req, res) => {
  const auth = res.locals.authUser as AuthUser;
  try {
    const rows = await prisma.enrollment.findMany({ where: { studentId: auth.userId, status: { in: ["ACTIVE", "COMPLETED"] } }, include: { course: { include: courseInclude } }, orderBy: { enrolledAt: "desc" } });
    return res.json(await Promise.all(rows.map((e) => shapeEnrollment(e, auth.userId))));
  } catch (e) { console.error("my enrollments", e); return res.status(500).json({ message: "Unable to load enrollments." }); }
});

router.get("/courses/:courseId/lessons/:lessonId", requireAuth, async (req, res) => {
  const auth = res.locals.authUser as AuthUser;
  try {
    const lesson = await prisma.lesson.findUnique({ where: { id: routeParam(req.params.lessonId) }, include: { section: { include: { course: { select: { id: true, status: true } } } }, questions: { orderBy: { position: "asc" }, select: { id: true, question: true, options: true, position: true } } } });
    if (!lesson || lesson.section.courseId !== routeParam(req.params.courseId) || lesson.section.course.status !== "PUBLISHED") return res.status(404).json({ message: "Lesson not found." });
    if (!lesson.isFree) {
      const enrollment = await prisma.enrollment.findUnique({ where: { studentId_courseId: { studentId: auth.userId, courseId: lesson.section.courseId } } });
      if (!enrollment || !["ACTIVE", "COMPLETED"].includes(enrollment.status)) return res.status(403).json({ message: "Enroll in this course to access this lesson." });
    }
    return res.json({ id: lesson.id, courseId: lesson.section.courseId, title: lesson.title, body: lesson.content || lesson.description || "", ...(lesson.videoUrl ? { videoUrl: lesson.videoUrl } : {}), language: "en", quiz: lesson.questions.map((q) => ({ id: q.id, question: q.question, options: Array.isArray(q.options) ? q.options : [] })), exercises: [], keyTakeaways: [] });
  } catch (e) { console.error("lesson", e); return res.status(500).json({ message: "Unable to load lesson." }); }
});

router.post("/courses/:courseId/lessons/:lessonId/complete", requireAuth, async (req, res) => {
  const auth = res.locals.authUser as AuthUser;
  try {
    const lesson = await prisma.lesson.findUnique({ where: { id: routeParam(req.params.lessonId) }, include: { section: { select: { courseId: true } } } });
    if (!lesson || lesson.section.courseId !== routeParam(req.params.courseId)) return res.status(404).json({ message: "Lesson not found." });
    const enrollment = await prisma.enrollment.findUnique({ where: { studentId_courseId: { studentId: auth.userId, courseId: routeParam(req.params.courseId) } } });
    if (!enrollment || !["ACTIVE", "COMPLETED"].includes(enrollment.status)) return res.status(403).json({ message: "You must be enrolled to complete lessons." });
    await prisma.lessonProgress.upsert({ where: { userId_lessonId: { userId: auth.userId, lessonId: lesson.id } }, create: { userId: auth.userId, lessonId: lesson.id, completed: true, completedAt: new Date() }, update: { completed: true, completedAt: new Date() } });
    const updated = await prisma.enrollment.findUnique({ where: { id: enrollment.id }, include: { course: { include: courseInclude } } });
    const shaped = await shapeEnrollment(updated, auth.userId);
    if (shaped.progress === 100) {
      await prisma.enrollment.update({ where: { id: enrollment.id }, data: { status: "COMPLETED", completedAt: new Date() } });
      const existingCertificate = await prisma.certificate.findUnique({ where: { userId_courseId: { userId: auth.userId, courseId: routeParam(req.params.courseId) } }, select: { id: true } });
      if (!existingCertificate) {
        const [user, course] = await Promise.all([prisma.user.findUnique({ where: { id: auth.userId }, select: { name: true } }), prisma.course.findUnique({ where: { id: routeParam(req.params.courseId) }, select: { title: true } })]);
        if (user && course) {
          await prisma.certificate.create({ data: { credentialId: `DEVORA-${randomUUID()}`, userId: auth.userId, courseId: routeParam(req.params.courseId), courseTitle: course.title, studentName: user.name } });
          await prisma.appNotification.create({ data: { userId: auth.userId, title: "Course completed", body: `You completed ${course.title}. Your certificate is ready.`, type: "certificate", link: "/certificates" } });
        }
      }
    }
    return res.json(shaped);
  } catch (e) { console.error("complete lesson", e); return res.status(500).json({ message: "Unable to complete lesson." }); }
});

router.post("/courses/:courseId/lessons/:lessonId/quiz", requireAuth, async (req, res) => {
  const auth = res.locals.authUser as AuthUser; const answers = req.body?.answers;
  if (!Array.isArray(answers) || !answers.every((a: unknown) => Number.isInteger(a))) return res.status(422).json({ message: "Answers must be an array of option indexes." });
  try {
    const lesson = await prisma.lesson.findUnique({ where: { id: routeParam(req.params.lessonId) }, include: { section: { select: { courseId: true } }, questions: { orderBy: { position: "asc" } } } });
    if (!lesson || lesson.section.courseId !== routeParam(req.params.courseId) || lesson.type !== "QUIZ") return res.status(404).json({ message: "Quiz not found." });
    const enrollment = await prisma.enrollment.findUnique({ where: { studentId_courseId: { studentId: auth.userId, courseId: routeParam(req.params.courseId) } } });
    if (!enrollment || !["ACTIVE", "COMPLETED"].includes(enrollment.status)) return res.status(403).json({ message: "Enroll in this course to take the quiz." });
    if (!lesson.questions.length || answers.length !== lesson.questions.length) return res.status(422).json({ message: "Answer every quiz question." });
    let score = 0; const correctAnswers: number[] = [];
    lesson.questions.forEach((q, i) => { correctAnswers.push(q.correct); if (answers[i] === q.correct) score++; });
    const passed = Math.round(score / lesson.questions.length * 100) >= 60;
    await prisma.quizAttempt.create({ data: { userId: auth.userId, lessonId: lesson.id, answers, score, total: lesson.questions.length, passed } });
    if (passed) await prisma.lessonProgress.upsert({ where: { userId_lessonId: { userId: auth.userId, lessonId: lesson.id } }, create: { userId: auth.userId, lessonId: lesson.id, completed: true, completedAt: new Date() }, update: { completed: true, completedAt: new Date() } });
    return res.json({ score, total: lesson.questions.length, passed, correctAnswers, attemptedAt: new Date().toISOString() });
  } catch (e) { console.error("quiz submit", e); return res.status(500).json({ message: "Unable to submit quiz." }); }
});


router.get("/me/bookmarks", requireAuth, async (_req, res) => {
  const auth = res.locals.authUser as AuthUser;
  try {
    const saved = await prisma.$queryRaw<Array<{ courseId: string }>>`SELECT "courseId" FROM "Bookmark" WHERE "userId" = ${auth.userId}::uuid ORDER BY "createdAt" DESC`;
    if (!saved.length) return res.json([]);
    const courses = await prisma.course.findMany({ where: { id: { in: saved.map((x) => x.courseId) }, status: "PUBLISHED" }, include: courseInclude });
    const map = new Map(courses.map((course) => [course.id, course]));
    return res.json((await Promise.all(saved.map((x) => map.get(x.courseId)).filter(Boolean).map((course) => courseSummary(course)) )));
  } catch (e) { console.error("bookmarks", e); return res.status(500).json({ message: "Unable to load bookmarks. Apply the latest Prisma migration first." }); }
});
router.put("/me/bookmarks/:courseId", requireAuth, async (req, res) => {
  const auth = res.locals.authUser as AuthUser;
  try {
    const course = await prisma.course.findFirst({ where: { OR: [{ id: routeParam(req.params.courseId) }, { slug: routeParam(req.params.courseId) }], status: "PUBLISHED" }, select: { id: true } });
    if (!course) return res.status(404).json({ message: "Course not found." });
    await prisma.$executeRaw`INSERT INTO "Bookmark" ("id", "userId", "courseId", "createdAt") VALUES (${randomUUID()}::uuid, ${auth.userId}::uuid, ${course.id}::uuid, NOW()) ON CONFLICT ("userId", "courseId") DO NOTHING`;
    return res.status(204).end();
  } catch (e) { console.error("add bookmark", e); return res.status(500).json({ message: "Unable to save bookmark. Apply the latest Prisma migration first." }); }
});
router.delete("/me/bookmarks/:courseId", requireAuth, async (req, res) => {
  const auth = res.locals.authUser as AuthUser;
  try {
    await prisma.$executeRaw`DELETE FROM "Bookmark" WHERE "userId" = ${auth.userId}::uuid AND "courseId" IN (SELECT "id" FROM "Course" WHERE "id"::text = ${routeParam(req.params.courseId)} OR "slug" = ${routeParam(req.params.courseId)})`;
    return res.status(204).end();
  } catch (e) { console.error("remove bookmark", e); return res.status(500).json({ message: "Unable to remove bookmark." }); }
});

router.get("/me/certificates", requireAuth, async (_req, res) => {
  const auth = res.locals.authUser as AuthUser;
  try { return res.json(await prisma.certificate.findMany({ where: { userId: auth.userId }, orderBy: { issuedAt: "desc" }, select: { id: true, courseId: true, courseTitle: true, studentName: true, issuedAt: true, credentialId: true } })); }
  catch (e) { console.error("my certificates", e); return res.status(500).json({ message: "Unable to load certificates." }); }
});
router.get("/certificates/verify/:credentialId", async (req, res) => {
  try { const c = await prisma.certificate.findUnique({ where: { credentialId: routeParam(req.params.credentialId) }, select: { id: true, courseId: true, courseTitle: true, studentName: true, issuedAt: true, credentialId: true } }); return res.json(c ? { valid: true, certificate: c } : { valid: false }); }
  catch (e) { console.error("verify certificate", e); return res.status(500).json({ message: "Unable to verify certificate." }); }
});
router.get("/me/notifications", requireAuth, async (_req, res) => {
  const auth = res.locals.authUser as AuthUser;
  try { const rows = await prisma.appNotification.findMany({ where: { userId: auth.userId }, orderBy: { createdAt: "desc" } }); return res.json(rows.map((n) => ({ id: n.id, title: n.title, body: n.body, type: ["payment", "course", "certificate", "system"].includes(n.type) ? n.type : "system", read: n.read, createdAt: n.createdAt.toISOString(), ...(n.link ? { link: n.link } : {}) }))); }
  catch (e) { console.error("notifications", e); return res.status(500).json({ message: "Unable to load notifications." }); }
});
router.post("/me/notifications/read-all", requireAuth, async (_req, res) => { const auth = res.locals.authUser as AuthUser; try { await prisma.appNotification.updateMany({ where: { userId: auth.userId, read: false }, data: { read: true } }); return res.status(204).end(); } catch { return res.status(500).json({ message: "Unable to update notifications." }); } });
router.post("/me/notifications/:id/read", requireAuth, async (req, res) => { const auth = res.locals.authUser as AuthUser; try { await prisma.appNotification.updateMany({ where: { id: routeParam(req.params.id), userId: auth.userId }, data: { read: true } }); return res.status(204).end(); } catch { return res.status(500).json({ message: "Unable to update notification." }); } });
router.delete("/me/notifications/:id", requireAuth, async (req, res) => { const auth = res.locals.authUser as AuthUser; try { await prisma.appNotification.deleteMany({ where: { id: routeParam(req.params.id), userId: auth.userId } }); return res.status(204).end(); } catch { return res.status(500).json({ message: "Unable to delete notification." }); } });
router.delete("/me/notifications", requireAuth, async (_req, res) => { const auth = res.locals.authUser as AuthUser; try { await prisma.appNotification.deleteMany({ where: { userId: auth.userId } }); return res.status(204).end(); } catch { return res.status(500).json({ message: "Unable to delete notifications." }); } });

export default router;
