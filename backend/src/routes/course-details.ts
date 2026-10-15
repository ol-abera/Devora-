
import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const course = await prisma.course.findFirst({
      where: {
        slug,
        status: "PUBLISHED",
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        sections: {
          orderBy: {
            position: "asc",
          },
          include: {
            lessons: {
              orderBy: {
                position: "asc",
              },
              select: {
                id: true,
                title: true,
                description: true,
                duration: true,
                type: true,
                position: true,
                isFree: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...course,
        level:
          course.level.charAt(0) +
          course.level.slice(1).toLowerCase(),
        status: course.status.toLowerCase(),
        sections: course.sections.map((section) => ({
          ...section,
          lessons: section.lessons.map((lesson) => ({
            ...lesson,
            type: lesson.type.toLowerCase(),
          })),
        })),
      },
    });
  } catch (error) {
    console.error("Failed to fetch course details:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch course details",
    });
  }
});

export default router;
