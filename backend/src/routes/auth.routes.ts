import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/jwt";
import { requireAuth, type AuthRequest } from "../middleware/auth";

const router = Router();

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
  planningMode: z.enum(["student", "professional", "freelancer", "personal"]).optional(),
  calendarPref: z.enum(["gregorian", "ethiopian", "both"]).optional()
});

router.post("/register", async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) return res.status(409).json({ error: "Email is already registered." });

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        planningMode: input.planningMode ?? "student",
        calendarPref: input.calendarPref ?? "gregorian"
      },
      select: {
        id: true,
        name: true,
        email: true,
        planningMode: true,
        calendarPref: true,
        createdAt: true
      }
    });
    return res.status(201).json({ user, token: signToken(user.id) });
  } catch (error) {
    next(error);
  }
});

const loginSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(128),
  remember: z.boolean().optional().default(false)
});

router.post("/login", async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        planningMode: user.planningMode,
        calendarPref: user.calendarPref,
        createdAt: user.createdAt
      },
      token: signToken(user.id, input.remember)
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: {
        id: true,
        name: true,
        email: true,
        planningMode: true,
        calendarPref: true,
        createdAt: true
      }
    });
    if (!user) return res.status(404).json({ error: "User not found." });
    return res.json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;
