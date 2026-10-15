import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();
const registerSchema = z.object({ name: z.string().trim().min(2).max(100), email: z.string().trim().email().max(255), password: z.string().min(8).max(128), role: z.enum(["student", "instructor"]).optional() });
const loginSchema = z.object({ email: z.string().trim().email().max(255), password: z.string().min(1).max(128) });
const profileSchema = z.object({ name: z.string().trim().min(2).max(100).optional(), weeklyReminder: z.boolean().optional(), weeklyGoal: z.number().int().min(1).max(168).optional(), locale: z.enum(["en", "am", "om"]).optional(), preferredLanguage: z.string().trim().min(2).max(20).optional(), avatar: z.string().max(500).optional() });
function createToken(user: { id: string; role: string }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing from .env");
  return jwt.sign({ userId: user.id, role: user.role }, secret, { expiresIn: "1d" });
}
function publicUser(user: any, lessonsThisWeek = 0) {
  return { id: user.id, name: user.name, email: user.email, role: String(user.role).toLowerCase(), avatar: user.avatar || user.name.split(/\s+/).filter(Boolean).slice(0, 2).map((x: string) => x[0]?.toUpperCase()).join(""), createdAt: user.createdAt.toISOString(), status: String(user.status).toLowerCase(), weeklyReminder: user.weeklyReminder, weeklyGoal: user.weeklyGoal, lessonsThisWeek, locale: ["en", "am", "om"].includes(user.preferredLanguage) ? user.preferredLanguage : "en" };
}
async function profileFor(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, role: true, status: true, avatar: true, createdAt: true, weeklyReminder: true, weeklyGoal: true, preferredLanguage: true } });
  if (!user) return null;
  const lessonsThisWeek = await prisma.lessonProgress.count({ where: { userId, completed: true, completedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } });
  return publicUser(user, lessonsThisWeek);
}

router.post("/auth/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(422).json({ message: "Enter a valid name, email, and password with at least 8 characters.", fields: { email: "Check the email address and required fields." } });
  try {
    const email = parsed.data.email.toLowerCase();
    if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) return res.status(409).json({ message: "An account with this email already exists.", fields: { email: "Email already used" } });
    const user = await prisma.user.create({ data: { name: parsed.data.name, email, passwordHash: await bcrypt.hash(parsed.data.password, 12), role: parsed.data.role === "instructor" ? "INSTRUCTOR" : "STUDENT", status: "ACTIVE" } });
    return res.status(201).json({ user: await profileFor(user.id), token: createToken(user) });
  } catch (error) { console.error("register", error); return res.status(500).json({ message: "Unable to create account." }); }
});

router.post("/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(422).json({ message: "Enter a valid email and password." });
  try {
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
    if (!user?.passwordHash || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return res.status(401).json({ message: "Invalid email or password." });
    if (user.status === "SUSPENDED") return res.status(403).json({ message: "This account has been suspended." });
    return res.json({ user: await profileFor(user.id), token: createToken(user) });
  } catch (error) { console.error("login", error); return res.status(500).json({ message: "Unable to log in." }); }
});

router.post("/auth/google", async (req, res) => {
  const idToken = typeof req.body?.idToken === "string" ? req.body.idToken : "";
  if (!idToken) return res.status(400).json({ message: "Google ID token is required.", code: "INVALID_TOKEN" });
  if (!process.env.GOOGLE_CLIENT_ID) return res.status(503).json({ message: "Google sign-in is not configured on this server." });
  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!response.ok) return res.status(400).json({ message: "Google token is invalid.", code: "INVALID_TOKEN" });
    const claims = await response.json() as { aud?: string; iss?: string; exp?: string; email?: string; email_verified?: string | boolean; name?: string; sub?: string; picture?: string };
    const expiry = Number(claims.exp || 0);
    if (claims.aud !== process.env.GOOGLE_CLIENT_ID || !["accounts.google.com", "https://accounts.google.com"].includes(claims.iss || "") || expiry * 1000 <= Date.now() || claims.email_verified !== true && claims.email_verified !== "true" || !claims.email || !claims.sub) return res.status(400).json({ message: "Google token failed verification.", code: "INVALID_TOKEN" });
    const email = claims.email.toLowerCase();
    let identity = await prisma.authIdentity.findUnique({ where: { provider_providerSubject: { provider: "google", providerSubject: claims.sub } }, include: { user: true } });
    let user = identity?.user ?? await prisma.user.findUnique({ where: { email } });
    if (user?.status === "SUSPENDED") return res.status(403).json({ message: "This account has been suspended." });
    if (!user) user = await prisma.user.create({ data: { name: claims.name || email.split("@")[0], email, avatar: claims.picture || "", emailVerified: true, status: "ACTIVE", role: req.body?.role === "instructor" ? "INSTRUCTOR" : "STUDENT" } });
    if (!identity) {
      const existing = await prisma.authIdentity.findUnique({ where: { userId_provider: { userId: user.id, provider: "google" } } });
      if (!existing) await prisma.authIdentity.create({ data: { provider: "google", providerSubject: claims.sub, userId: user.id } });
    }
    return res.json({ user: await profileFor(user.id), token: createToken(user) });
  } catch (error) { console.error("Google auth", error); return res.status(500).json({ message: "Google sign-in failed." }); }
});

router.post("/auth/logout", requireAuth, (_req, res) => res.status(204).end());
router.get("/auth/me", requireAuth, async (_req, res) => {
  const auth = res.locals.authUser as { userId: string };
  try { const user = await profileFor(auth.userId); if (!user) return res.status(401).json({ message: "Account not found." }); if (user.status === "suspended") return res.status(403).json({ message: "This account has been suspended." }); return res.json(user); }
  catch (error) { console.error("profile", error); return res.status(500).json({ message: "Unable to retrieve your profile." }); }
});
router.patch("/me", requireAuth, async (req, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success || Object.keys(parsed.data ?? {}).length === 0) return res.status(422).json({ message: "Provide valid profile fields." });
  const auth = res.locals.authUser as { userId: string };
  try {
    const data: any = { ...parsed.data };
    if (parsed.data.locale) { data.preferredLanguage = parsed.data.locale; delete data.locale; }
    await prisma.user.update({ where: { id: auth.userId }, data });
    const profile = await profileFor(auth.userId);
    return res.json(profile);
  } catch (error) { console.error("profile update", error); return res.status(500).json({ message: "Unable to update your profile." }); }
});
router.post("/auth/forgot-password", async (_req, res) => {
  // Deliberately generic to prevent account enumeration. Delivery requires an email provider configuration.
  return res.json({ message: "If an account exists for that email, password reset instructions will be sent." });
});
router.post("/auth/reset-password", async (_req, res) => res.status(501).json({ message: "Password reset is not configured yet. An email delivery provider and reset-token storage must be configured." }));

export default router;
