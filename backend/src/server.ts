import playgroundRouter from "./routes/playground";
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import enrollmentsRouter from "./routes/enrollments";
import authRouter from "./routes/auth";
import coursesRouter from "./routes/courses";
import courseDetailsRouter from "./routes/course-details";
import progressRouter from "./routes/progress";
import quizzesRouter from "./routes/quizzes";
import certificatesRouter from "./routes/certificates";
import platformRouter from "./routes/platform";
const app = express();

const PORT = Number(process.env.PORT) || 4000;
const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

// Middleware â€” must run before the routes
app.use(helmet());
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json({ limit: "1mb" }));
// Contract routes used by the existing frontend (VITE_API_URL defaults to /api).
app.use("/api", platformRouter);
app.use("/api", playgroundRouter);
app.use("/api", authRouter);
app.use("/api/v1/enrollments", enrollmentsRouter);
app.use("/api/v1/progress", progressRouter);
app.use("/api/v1/quizzes", quizzesRouter);
app.use("/api/v1/certificates", certificatesRouter);
// Health checks
app.get("/api/health", (_req, res) => res.status(200).json({ status: "ok" }));
app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Devora API is running",
  });
});

// API routes
app.use("/api/v1", authRouter);
app.use("/api/v1/courses", coursesRouter);
app.use("/api/v1/course-details", courseDetailsRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Devora API running at http://localhost:${PORT}`);
});
