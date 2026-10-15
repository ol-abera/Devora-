
import { Router } from "express";
import { randomUUID } from "crypto";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();

type AuthUser = {
  userId: string;
  role: string;
};

// Issue a certificate after the student completes every lesson.
router.post("/:courseId/issue", requireAuth, async (req, res) => {
  const authUser = res.locals.authUser as AuthUser;
  const { courseId } = req.params;

  if (authUser.role !== "STUDENT") {
    return res.status(403).json({
      success: false,
      message: "Only students can receive course certificates.",
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
      select: { name: true, status: true },
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
      select: { status: true },
    });

    if (
      !enrollment ||
      !["ACTIVE", "COMPLETED"].includes(enrollment.status)
    ) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course first.",
      });
    }

    const existingCertificate = await prisma.certificate.findUnique({
      where: {
        userId_courseId: {
          userId: authUser.userId,
          courseId,
        },
      },
    });

    if (existingCertificate) {
      return res.status(200).json({
        success: true,
        message: "You already have a certificate for this course.",
        data: existingCertificate,
      });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        sections: {
          select: {
            lessons: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    const lessonIds = course.sections.flatMap((section) =>
      section.lessons.map((lesson) => lesson.id)
    );

    if (lessonIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "This course has no lessons to complete yet.",
      });
    }

    const completedCount = await prisma.lessonProgress.count({
      where: {
        userId: authUser.userId,
        lessonId: { in: lessonIds },
        completed: true,
      },
    });

    if (completedCount !== lessonIds.length) {
      return res.status(400).json({
        success: false,
        message: "Complete every lesson before requesting a certificate.",
        data: {
          completedLessons: completedCount,
          totalLessons: lessonIds.length,
          remainingLessons: lessonIds.length - completedCount,
        },
      });
    }

    const certificate = await prisma.certificate.create({
      data: {
        credentialId: `DEVORA-${randomUUID()}`,
        userId: authUser.userId,
        courseId: course.id,
        courseTitle: course.title,
        studentName: user.name,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Course certificate issued successfully.",
      data: certificate,
    });
  } catch (error) {
    console.error("Issue certificate error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to issue certificate.",
    });
  }
});

// Get the logged-in student's certificates.
router.get("/my", requireAuth, async (req, res) => {
  const authUser = res.locals.authUser as AuthUser;

  if (authUser.role !== "STUDENT") {
    return res.status(403).json({
      success: false,
      message: "Only students can view their certificates.",
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

    const certificates = await prisma.certificate.findMany({
      where: { userId: authUser.userId },
      orderBy: { issuedAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates,
    });
  } catch (error) {
    console.error("Fetch certificates error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch certificates.",
    });
  }
});

/** Publicly verify a certificate using its credential ID. */
router.get("/verify/:credentialId", async (req, res) => {
  const { credentialId } = req.params;

  if (typeof credentialId !== "string" || !credentialId.trim()) {
    return res.status(400).json({
      success: false,
      valid: false,
      message: "A valid credential ID is required.",
    });
  }

  try {
    const certificate = await prisma.certificate.findUnique({
      where: { credentialId: credentialId.trim() },
      select: {
        credentialId: true,
        studentName: true,
        courseTitle: true,
        issuedAt: true,
      },
    });

    if (!certificate) {
      return res.status(404).json({
        success: true,
        valid: false,
        message: "No certificate found with this credential ID.",
      });
    }

    return res.status(200).json({
      success: true,
      valid: true,
      message: "Certificate verified successfully.",
      data: certificate,
    });
  } catch (error) {
    console.error("Verify certificate error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify certificate.",
    });
  }
});


export default router;
