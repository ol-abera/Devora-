
import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();

type AuthUser = {
  userId: string;
  role: string;
};

// Mark an enrolled student's lesson as completed.
router.post("/:lessonId/complete", requireAuth, async (req, res) => {
  const authUser = res.locals.authUser as AuthUser;
  const { lessonId } = req.params;

  if (authUser.role !== "STUDENT") {
    return res.status(403).json({
      success: false,
      message: "Only students can update lesson progress.",
    });
  }

  if (typeof lessonId !== "string" || !lessonId.trim()) {
    return res.status(400).json({
      success: false,
      message: "A valid lesson ID is required.",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { status: true },
    });

    if (!user || user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Your account must be active.",
      });
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        section: {
          select: {
            courseId: true,
          },
        },
      },
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found.",
      });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: authUser.userId,
          courseId: lesson.section.courseId,
        },
      },
    });

    if (
      !enrollment ||
      !["ACTIVE", "COMPLETED"].includes(enrollment.status)
    ) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to access its progress.",
      });
    }

    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: authUser.userId,
          lessonId: lesson.id,
        },
      },
      create: {
        userId: authUser.userId,
        lessonId: lesson.id,
        completed: true,
        completedAt: new Date(),
      },
      update: {
        completed: true,
        completedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Lesson marked as completed.",
      data: progress,
    });
  } catch (error) {
    console.error("Mark lesson complete error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update lesson progress.",
    });
  }
});

// Get lesson progress for a course the student is enrolled in.
router.get("/course/:courseId", requireAuth, async (req, res) => {
  const authUser = res.locals.authUser as AuthUser;
  const { courseId } = req.params;

  if (authUser.role !== "STUDENT") {
    return res.status(403).json({
      success: false,
      message: "Only students can view student progress.",
    });
  }

  if (typeof courseId !== "string" || !courseId.trim()) {
    return res.status(400).json({
      success: false,
      message: "A valid course ID is required.",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { status: true },
    });

    if (!user || user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Your account must be active.",
      });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: authUser.userId,
          courseId,
        },
      },
    });

    if (
      !enrollment ||
      !["ACTIVE", "COMPLETED"].includes(enrollment.status)
    ) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to view its progress.",
      });
    }

    const sections = await prisma.section.findMany({
      where: { courseId },
      orderBy: { position: "asc" },
      include: {
        lessons: {
          orderBy: { position: "asc" },
          include: {
            progress: {
              where: { userId: authUser.userId },
              select: {
                completed: true,
                completedAt: true,
              },
            },
          },
        },
      },
    });

    const data = sections.map((section) => ({
      id: section.id,
      title: section.title,
      position: section.position,
      lessons: section.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        duration: lesson.duration,
        type: lesson.type.toLowerCase(),
        position: lesson.position,
        completed: lesson.progress[0]?.completed ?? false,
        completedAt: lesson.progress[0]?.completedAt ?? null,
      })),
    }));

    const totalLessons = data.reduce(
      (total, section) => total + section.lessons.length,
      0
    );

    const completedLessons = data.reduce(
      (total, section) =>
        total + section.lessons.filter((lesson) => lesson.completed).length,
      0
    );

    return res.status(200).json({
      success: true,
      courseId,
      totalLessons,
      completedLessons,
      completionPercentage:
        totalLessons === 0
          ? 0
          : Math.round((completedLessons / totalLessons) * 100),
      data,
    });
  } catch (error) {
    console.error("Fetch lesson progress error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch lesson progress.",
    });
  }
});

export default router;
