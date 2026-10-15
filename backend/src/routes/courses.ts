
import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const q =
      typeof req.query.q === "string"
        ? req.query.q.trim()
        : "";

    const category =
      typeof req.query.category === "string"
        ? req.query.category.trim()
        : "";

    const rawLevel =
      typeof req.query.level === "string"
        ? req.query.level.trim().toUpperCase()
        : "";

    const validLevels = [
      "BEGINNER",
      "INTERMEDIATE",
      "ADVANCED",
    ];

    if (rawLevel && !validLevels.includes(rawLevel)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid level. Use beginner, intermediate, or advanced.",
      });
    }

    const courses = await prisma.course.findMany({
      where: {
        status: "PUBLISHED",

        ...(q
          ? {
              OR: [
                {
                  title: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
                {
                  subtitle: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
                {
                  description: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
                {
                  category: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),

        ...(category
          ? {
              category: {
                equals: category,
                mode: "insensitive" as const,
              },
            }
          : {}),

        ...(rawLevel
          ? {
              level: rawLevel as
                | "BEGINNER"
                | "INTERMEDIATE"
                | "ADVANCED",
            }
          : {}),
      },

      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    const data = courses.map((course) => ({
      ...course,
      level:
        course.level.charAt(0) +
        course.level.slice(1).toLowerCase(),
      status: course.status.toLowerCase(),
    }));

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Failed to fetch courses:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
    });
  }
});

export default router;
