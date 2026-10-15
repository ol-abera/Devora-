
import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();

type AuthUser = {
  userId: string;
  role: string;
};

const PASS_PERCENTAGE = 70;

async function checkQuizAccess(
  lessonId: string,
  userId: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { status: true },
  });

  if (!user || user.status !== "ACTIVE") {
    return { error: "Your account must be active.", status: 403 as const };
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      title: true,
      type: true,
      section: { select: { courseId: true } },
    },
  });

  if (!lesson || lesson.type !== "QUIZ") {
    return {
      error: "Quiz lesson not found.",
      status: 404 as const,
    };
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: userId,
        courseId: lesson.section.courseId,
      },
    },
  });

  if (
    !enrollment ||
    !["ACTIVE", "COMPLETED"].includes(enrollment.status)
  ) {
    return {
      error: "You must be enrolled in this course to access its quiz.",
      status: 403 as const,
    };
  }

  return { lesson };
}

/* Get the logged-in student's quiz history. */
router.get("/history", requireAuth, async (req, res) => {
  const authUser = res.locals.authUser as AuthUser;

  if (authUser.role !== "STUDENT") {
    return res.status(403).json({
      success: false,
      message: "Only students can view quiz history.",
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

    const attempts = await prisma.quizAttempt.findMany({
      where: { userId: authUser.userId },
      orderBy: { attemptedAt: "desc" },
      take: 50,
      select: {
        id: true,
        lessonId: true,
        score: true,
        total: true,
        passed: true,
        attemptedAt: true,
      },
    });

    const lessonIds = [...new Set(attempts.map((a) => a.lessonId))];

    const lessons = lessonIds.length
      ? await prisma.lesson.findMany({
          where: { id: { in: lessonIds } },
          select: {
            id: true,
            title: true,
            section: {
              select: {
                course: {
                  select: { title: true },
                },
              },
            },
          },
        })
      : [];

    const lessonMap = new Map(lessons.map((lesson) => [lesson.id, lesson]));

    const history = attempts.map((attempt) => {
      const lesson = lessonMap.get(attempt.lessonId);

      return {
        attemptId: attempt.id,
        lessonId: attempt.lessonId,
        quizTitle: lesson?.title ?? "Quiz",
        courseTitle: lesson?.section.course.title ?? "Course",
        score: attempt.score,
        total: attempt.total,
        percentage:
          attempt.total > 0
            ? Math.round((attempt.score / attempt.total) * 100)
            : 0,
        passed: attempt.passed,
        attemptedAt: attempt.attemptedAt,
      };
    });

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    console.error("Fetch quiz history error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch quiz history.",
    });
  }
});

// Get quiz questions without revealing their correct answers.
router.get("/:lessonId", requireAuth, async (req, res) => {
  const authUser = res.locals.authUser as AuthUser;
  const lessonId = req.params.lessonId;

  if (authUser.role !== "STUDENT") {
    return res.status(403).json({
      success: false,
      message: "Only students can take quizzes.",
    });
  }

  if (typeof lessonId !== "string" || !lessonId.trim()) {
    return res.status(400).json({
      success: false,
      message: "A valid lesson ID is required.",
    });
  }

  try {
    const access = await checkQuizAccess(
      lessonId,
      authUser.userId
    );

    if ("error" in access) {
  return res.status(access.status ?? 403).json({
    success: false,
    message: access.error,
  });
}

    const questions = await prisma.quizQuestion.findMany({
      where: { lessonId },
      orderBy: { position: "asc" },
      select: {
        id: true,
        question: true,
        options: true,
        position: true,
      },
    });

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No questions have been added to this quiz yet.",
      });
    }

    return res.status(200).json({
      success: true,
      lesson: {
        id: access.lesson.id,
        title: access.lesson.title,
      },
      totalQuestions: questions.length,
      data: questions,
    });
  } catch (error) {
    console.error("Fetch quiz error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch quiz questions.",
    });
  }
});

// Submit answers, calculate the score, and save the attempt.
router.post("/:lessonId/submit", requireAuth, async (req, res) => {
  const authUser = res.locals.authUser as AuthUser;
  const lessonId = req.params.lessonId;

  if (authUser.role !== "STUDENT") {
    return res.status(403).json({
      success: false,
      message: "Only students can submit quiz answers.",
    });
  }

  if (typeof lessonId !== "string" || !lessonId.trim()) {
    return res.status(400).json({
      success: false,
      message: "A valid lesson ID is required.",
    });
  }

  const answers = req.body?.answers;

  if (!Array.isArray(answers)) {
    return res.status(400).json({
      success: false,
      message: "Answers must be an array.",
    });
  }

  try {
    const access = await checkQuizAccess(
      lessonId,
      authUser.userId
    );

   if ("error" in access) {
  return res.status(access.status ?? 403).json({
    success: false,
    message: access.error,
  });
}
    const questions = await prisma.quizQuestion.findMany({
      where: { lessonId },
      orderBy: { position: "asc" },
    });

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No questions have been added to this quiz yet.",
      });
    }

    if (answers.length !== questions.length) {
      return res.status(400).json({
        success: false,
        message: `Please answer all ${questions.length} questions.`,
      });
    }

    const questionMap = new Map(
      questions.map((question) => [question.id, question])
    );

    const seen = new Set<string>();
    const savedAnswers: {
      questionId: string;
      selectedOption: number;
      isCorrect: boolean;
    }[] = [];

    let score = 0;

    for (const answer of answers) {
      if (
        !answer ||
        typeof answer.questionId !== "string" ||
        !Number.isInteger(answer.selectedOption)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each answer needs a questionId and an integer selectedOption.",
        });
      }

      const question = questionMap.get(answer.questionId);

      if (!question || seen.has(answer.questionId)) {
        return res.status(400).json({
          success: false,
          message: "Answers contain an invalid or duplicate question.",
        });
      }

      if (
        !Array.isArray(question.options) ||
        answer.selectedOption < 0 ||
        answer.selectedOption >= question.options.length
      ) {
        return res.status(400).json({
          success: false,
          message: "A selected answer option is invalid.",
        });
      }

      seen.add(answer.questionId);

      const isCorrect =
        answer.selectedOption === question.correct;

      if (isCorrect) {
        score++;
      }

      savedAnswers.push({
        questionId: question.id,
        selectedOption: answer.selectedOption,
        isCorrect,
      });
    }

    const total = questions.length;
    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= PASS_PERCENTAGE;

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: authUser.userId,
        lessonId,
        answers: savedAnswers,
        score,
        total,
        passed,
      },
    });
        // Mark the quiz lesson complete only after passing.
    if (passed) {
      await prisma.lessonProgress.upsert({
        where: {
          userId_lessonId: {
            userId: authUser.userId,
            lessonId,
          },
        },
        update: {
          completed: true,
          completedAt: new Date(),
        },
        create: {
          userId: authUser.userId,
          lessonId,
          completed: true,
          completedAt: new Date(),
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: "Quiz submitted successfully.",
      result: {
        attemptId: attempt.id,
        score,
        total,
        percentage,
        passed,
        passingPercentage: PASS_PERCENTAGE,
      },
    });
  } catch (error) {
    console.error("Submit quiz error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit quiz.",
    });
  }
});

export default router;
