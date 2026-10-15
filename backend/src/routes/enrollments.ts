
import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Enroll the logged-in student in a free, published course.
router.post("/:courseId", requireAuth, async (req, res) => {
  const authUser = res.locals.authUser as {
    userId: string;
    role: string;
  };

  if (authUser.role !== "STUDENT") {
    return res.status(403).json({
      success: false,
      message: "Only students can enroll in courses.",
    });
  }

  const courseId = req.params.courseId;

if (typeof courseId !== "string" || !courseId.trim()) {
  return res.status(400).json({
    success: false,
    message: "A valid course ID is required.",
  });
}

  if (!courseId) {
    return res.status(400).json({
      success: false,
      message: "Course ID is required.",
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
        message: "Your account must be active to enroll.",
      });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        price: true,
        status: true,
      },
    });

    if (!course || course.status !== "PUBLISHED") {
      return res.status(404).json({
        success: false,
        message: "Published course not found.",
      });
    }

    if (course.price > 0) {
      return res.status(400).json({
        success: false,
        message: "This course requires payment before enrollment.",
      });
    }

    const existing = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: authUser.userId,
          courseId: course.id,
        },
      },
    });

    if (existing) {
      if (existing.status === "ACTIVE" ||
          existing.status === "COMPLETED") {
        return res.status(409).json({
          success: false,
          message: "You are already enrolled in this course.",
        });
      }

      const enrollment = await prisma.enrollment.update({
        where: { id: existing.id },
        data: {
          status: "ACTIVE",
          source: "free",
          completedAt: null,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Enrollment reactivated successfully.",
        data: enrollment,
      });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: authUser.userId,
        courseId: course.id,
        status: "ACTIVE",
        source: "free",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Enrolled successfully.",
      data: enrollment,
    });
  } catch (error) {
    console.error("Enrollment error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to enroll in this course.",
    });
  }
});

// List the logged-in student's enrollments.
router.get("/my", requireAuth, async (_req, res) => {
  const authUser = res.locals.authUser as {
    userId: string;
    role: string;
  };

  if (authUser.role !== "STUDENT") {
    return res.status(403).json({
      success: false,
      message: "Only students can view student enrollments.",
    });
  }

  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: authUser.userId,
        status: {
          in: ["ACTIVE", "COMPLETED"],
        },
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    console.error("Fetch enrollments error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch your enrollments.",
    });
  }
});

export default router;
