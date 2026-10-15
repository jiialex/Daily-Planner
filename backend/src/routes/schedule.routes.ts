import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { type AuthRequest } from "../middleware/auth";

const router = Router();

const blockSchema = z.object({
  title: z.string().trim().min(1).max(160),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  notes: z.string().max(2000).optional().nullable(),
  taskId: z.string().optional().nullable()
});

router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const start = typeof req.query.start === "string" ? new Date(req.query.start) : new Date(new Date().setHours(0, 0, 0, 0));
    const end = typeof req.query.end === "string" ? new Date(req.query.end) : new Date(start.getTime() + 7 * 86400000);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
      return res.status(400).json({ error: "Provide valid start and end dates; end must be after start." });
    }
    const blocks = await prisma.scheduleBlock.findMany({
      where: { userId: req.userId!, startAt: { lt: end }, endAt: { gt: start } },
      include: {
        task: {
          select: {
            id: true,
            status: true,
            priority: true,
            goal: { select: { title: true } }
          }
        }
      },
      orderBy: { startAt: "asc" }
    });
    return res.json({ blocks });
  } catch (error) { next(error); }
});

router.post("/", async (req: AuthRequest, res, next) => {
  try {
    const input = blockSchema.parse(req.body);
    const startAt = new Date(input.startAt);
    const endAt = new Date(input.endAt);
    if (endAt <= startAt) return res.status(400).json({ error: "endAt must be after startAt." });

    if (input.taskId) {
      const task = await prisma.task.findFirst({ where: { id: input.taskId, userId: req.userId! } });
      if (!task) return res.status(400).json({ error: "Task not found for this user." });
    }

    const conflict = await prisma.scheduleBlock.findFirst({
      where: { userId: req.userId!, startAt: { lt: endAt }, endAt: { gt: startAt } }
    });
    if (conflict) return res.status(409).json({ error: "This time overlaps another schedule block.", conflict });

    const block = await prisma.scheduleBlock.create({
      data: { title: input.title, startAt, endAt, notes: input.notes ?? null, taskId: input.taskId ?? null, userId: req.userId! }
    });
    return res.status(201).json({ block });
  } catch (error) { next(error); }
});

router.delete("/:id", async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id;
    if (typeof id !== "string") return res.status(400).json({ error: "Invalid schedule block ID." });
    const result = await prisma.scheduleBlock.deleteMany({ where: { id, userId: req.userId! } });
    if (!result.count) return res.status(404).json({ error: "Schedule block not found." });
    return res.status(204).send();
  } catch (error) { next(error); }
});

export default router;
