import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import type { Prisma } from "@prisma/client";
import { type AuthRequest } from "../middleware/auth";

const router = Router();

const goalSchema = z.object({
  title: z.string().trim().min(1).max(160),
  category: z.string().trim().min(1).max(80).optional(),
  description: z.string().max(2000).optional().nullable(),
  targetDate: z.string().datetime().optional().nullable(),
  status: z.enum(["ACTIVE", "COMPLETED", "PAUSED"]).optional(),
  progress: z.number().int().min(0).max(100).optional()
});

router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.userId! },
      include: {
        _count: { select: { tasks: true } },
        tasks: { select: { status: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    return res.json({ goals: goals.map(withTaskCounts) });
  } catch (error) { next(error); }
});

router.post("/", async (req: AuthRequest, res, next) => {
  try {
    const input = goalSchema.parse(req.body);
    const goal = await prisma.goal.create({
      data: {
        title: input.title,
        category: input.category ?? "Personal",
        description: input.description ?? null,
        targetDate: input.targetDate ? new Date(input.targetDate) : null,
        status: input.status ?? "ACTIVE",
        progress: input.progress ?? 0,
        userId: req.userId!
      },
      include: {
        _count: { select: { tasks: true } },
        tasks: { select: { status: true } }
      }
    });
    return res.status(201).json({ goal: withTaskCounts(goal) });
  } catch (error) { next(error); }
});

router.patch("/:id", async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id;
    if (typeof id !== "string") return res.status(400).json({ error: "Invalid goal ID." });
    const input = goalSchema.partial().parse(req.body);
    const existing = await prisma.goal.findFirst({ where: { id, userId: req.userId! } });
    if (!existing) return res.status(404).json({ error: "Goal not found." });

    const data: Prisma.GoalUncheckedUpdateInput = { ...input };
    if (input.targetDate !== undefined) data.targetDate = input.targetDate ? new Date(input.targetDate) : null;
    const goal = await prisma.goal.update({
      where: { id: existing.id },
      data,
      include: {
        _count: { select: { tasks: true } },
        tasks: { select: { status: true } }
      }
    });
    return res.json({ goal: withTaskCounts(goal) });
  } catch (error) { next(error); }
});

router.delete("/:id", async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id;
    if (typeof id !== "string") return res.status(400).json({ error: "Invalid goal ID." });
    const goal = await prisma.goal.findFirst({
      where: { id, userId: req.userId! },
      select: { _count: { select: { tasks: true } } }
    });
    if (!goal) return res.status(404).json({ error: "Goal not found." });
    if (goal._count.tasks > 0) {
      return res.status(409).json({ error: "Move or delete this goal's tasks before deleting the goal." });
    }
    const result = await prisma.goal.deleteMany({ where: { id, userId: req.userId! } });
    if (!result.count) return res.status(404).json({ error: "Goal not found." });
    return res.status(204).send();
  } catch (error) { next(error); }
});

function withTaskCounts<T extends { _count: { tasks: number }; tasks: Array<{ status: string }> }>(goal: T) {
  const { _count, tasks, ...data } = goal;
  return {
    ...data,
    totalTasks: _count.tasks,
    completedTasks: tasks.filter((task) => task.status === "COMPLETED").length
  };
}

export default router;
