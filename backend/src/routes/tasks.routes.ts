import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import type { Prisma } from "@prisma/client";
import { type AuthRequest } from "../middleware/auth";

const router = Router();

const taskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(5000).optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  status: z.enum(["PENDING", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "MISSED", "RESCHEDULED", "UPCOMING"]).optional(),
  dueAt: z.string().datetime().optional().nullable(),
  estimatedMinutes: z.number().int().min(5).max(720).optional(),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  scheduledTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional().nullable(),
  goalId: z.string().optional().nullable(),
  dependencyId: z.string().optional().nullable()
});

router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.userId! },
      include: {
        goal: { select: { id: true, title: true } },
        dependency: { select: { id: true, title: true } }
      },
      orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }]
    });
    return res.json({ tasks });
  } catch (error) { next(error); }
});

router.post("/", async (req: AuthRequest, res, next) => {
  try {
    const input = taskSchema.parse(req.body);
    if (input.goalId || input.dependencyId) {
      const [goal, dependency] = await Promise.all([
        input.goalId ? prisma.goal.findFirst({ where: { id: input.goalId, userId: req.userId! } }) : null,
        input.dependencyId ? prisma.task.findFirst({ where: { id: input.dependencyId, userId: req.userId! } }) : null
      ]);
      if (input.goalId && !goal) return res.status(400).json({ error: "Goal not found for this user." });
      if (input.dependencyId && !dependency) {
        return res.status(400).json({ error: "Dependency task not found for this user." });
      }
    }
    const task = await prisma.task.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        priority: input.priority ?? "MEDIUM",
        status: input.status ?? "PENDING",
        dueAt: input.dueAt ? new Date(input.dueAt) : null,
        estimatedMinutes: input.estimatedMinutes ?? 30,
        scheduledDate: input.scheduledDate ?? null,
        scheduledTime: input.scheduledTime ?? null,
        goalId: input.goalId ?? null,
        dependencyId: input.dependencyId ?? null,
        userId: req.userId!
      },
      include: {
        goal: { select: { id: true, title: true } },
        dependency: { select: { id: true, title: true } }
      }
    });
    return res.status(201).json({ task });
  } catch (error) { next(error); }
});

router.patch("/:id", async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id;
    if (typeof id !== "string") return res.status(400).json({ error: "Invalid task ID." });
    const input = taskSchema.partial().parse(req.body);
    if (input.goalId || input.dependencyId) {
      const [goal, dependency] = await Promise.all([
        input.goalId ? prisma.goal.findFirst({ where: { id: input.goalId, userId: req.userId! } }) : null,
        input.dependencyId ? prisma.task.findFirst({ where: { id: input.dependencyId, userId: req.userId! } }) : null
      ]);
      if (input.goalId && !goal) return res.status(400).json({ error: "Goal not found for this user." });
      if (input.dependencyId && !dependency) {
        return res.status(400).json({ error: "Dependency task not found for this user." });
      }
    }
    const existing = await prisma.task.findFirst({ where: { id, userId: req.userId! } });
    if (!existing) return res.status(404).json({ error: "Task not found." });
    if (input.dependencyId === existing.id) {
      return res.status(400).json({ error: "A task cannot depend on itself." });
    }

    const data: Prisma.TaskUncheckedUpdateInput = { ...input };
    if (input.dueAt !== undefined) data.dueAt = input.dueAt ? new Date(input.dueAt) : null;
    if (input.status === "COMPLETED" && existing.status !== "COMPLETED") data.completedAt = new Date();
    if (input.status && input.status !== "COMPLETED") data.completedAt = null;

    const task = await prisma.task.update({
      where: { id: existing.id },
      data,
      include: {
        goal: { select: { id: true, title: true } },
        dependency: { select: { id: true, title: true } }
      }
    });
    return res.json({ task });
  } catch (error) { next(error); }
});

router.delete("/:id", async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id;
    if (typeof id !== "string") return res.status(400).json({ error: "Invalid task ID." });
    const result = await prisma.task.deleteMany({ where: { id, userId: req.userId! } });
    if (!result.count) return res.status(404).json({ error: "Task not found." });
    return res.status(204).send();
  } catch (error) { next(error); }
});

router.delete("/", async (req: AuthRequest, res, next) => {
  try {
    const schema = z.object({ ids: z.array(z.string()).min(1).max(500) });
    const input = schema.parse(req.body);
    const result = await prisma.task.deleteMany({
      where: { id: { in: input.ids }, userId: req.userId! }
    });
    return res.json({ deleted: result.count });
  } catch (error) { next(error); }
});

export default router;
