import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { type AuthRequest } from "../middleware/auth";

const router = Router();

const planSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dayStartHour: z.number().int().min(0).max(23).default(9),
  dayEndHour: z.number().int().min(1).max(24).default(17),
  breakMinutes: z.number().int().min(0).max(120).default(10)
});

const priorityScore = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 } as const;

router.post("/day", async (req: AuthRequest, res, next) => {
  try {
    const input = planSchema.parse(req.body ?? {});
    if (input.dayEndHour <= input.dayStartHour) {
      return res.status(400).json({ error: "dayEndHour must be later than dayStartHour." });
    }

    const now = new Date();
    const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const date = input.date ?? localDate;
    const day = new Date(`${date}T00:00:00`);
    if (Number.isNaN(day.getTime())) return res.status(400).json({ error: "Invalid date." });
    const dayStart = new Date(day);
    dayStart.setHours(input.dayStartHour, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(input.dayEndHour, 0, 0, 0);

    const [tasks, existingBlocks] = await Promise.all([
      prisma.task.findMany({
        where: { userId: req.userId!, status: { not: "COMPLETED" } },
        include: { dependency: { select: { status: true } } }
      }),
      prisma.scheduleBlock.findMany({
        where: { userId: req.userId!, startAt: { lt: dayEnd }, endAt: { gt: dayStart } },
        orderBy: { startAt: "asc" }
      })
    ]);

    const occupied = existingBlocks.map((b) => ({ start: b.startAt, end: b.endAt }));
    const candidates = tasks
      .filter((task) => (!task.scheduledDate || task.scheduledDate <= date) && !existingBlocks.some((b) => b.taskId === task.id))
      .sort((a, b) => {
        const p = priorityScore[b.priority] - priorityScore[a.priority];
        if (p !== 0) return p;
        if (a.dueAt && b.dueAt) return a.dueAt.getTime() - b.dueAt.getTime();
        if (a.dueAt) return -1;
        if (b.dueAt) return 1;
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

    const suggestions: Array<{ taskId: string; title: string; startAt: string; endAt: string; minutes: number; priority: string }> = [];
    const conflicts: Array<{ taskId: string; title: string; reason: string }> = [];

    for (const task of candidates) {
      if (task.dependency && task.dependency.status !== "COMPLETED") {
        conflicts.push({ taskId: task.id, title: task.title, reason: "Complete the dependency task before scheduling this task." });
        continue;
      }

      const duration = task.estimatedMinutes * 60000;
      let cursor = new Date(dayStart);
      if (task.scheduledDate === date && task.scheduledTime) {
        const [hour, minute] = task.scheduledTime.split(":").map(Number);
        const preferredStart = new Date(dayStart);
        preferredStart.setHours(hour, minute, 0, 0);
        if (preferredStart >= dayStart && preferredStart < dayEnd) cursor = preferredStart;
      }
      let placed = false;

      while (cursor.getTime() + duration <= dayEnd.getTime()) {
        const collision = occupied
          .filter((block) => block.end > cursor && block.start < new Date(cursor.getTime() + duration))
          .sort((a, b) => a.start.getTime() - b.start.getTime())[0];

        if (!collision) {
          const end = new Date(cursor.getTime() + duration);
          suggestions.push({
            taskId: task.id,
            title: task.title,
            startAt: cursor.toISOString(),
            endAt: end.toISOString(),
            minutes: task.estimatedMinutes,
            priority: task.priority
          });
          occupied.push({ start: cursor, end });
          occupied.sort((a, b) => a.start.getTime() - b.start.getTime());
          placed = true;
          break;
        }
        cursor = new Date(collision.end.getTime() + input.breakMinutes * 60000);
      }

      if (!placed) {
        conflicts.push({ taskId: task.id, title: task.title, reason: "No available time slot in the selected working hours." });
      }
    }

    return res.json({
      date,
      workingHours: { start: dayStart.toISOString(), end: dayEnd.toISOString() },
      suggestions,
      notScheduled: conflicts,
      note: "Rule-based suggestions only. No schedule blocks were saved. Review the plan before saving blocks."
    });
  } catch (error) { next(error); }
});

router.post("/day/save", async (req: AuthRequest, res, next) => {
  try {
    const schema = z.object({
      blocks: z.array(z.object({
        taskId: z.string(),
        startAt: z.string().datetime(),
        endAt: z.string().datetime()
      })).min(1).max(100)
    });
    const input = schema.parse(req.body);
    const ids = [...new Set(input.blocks.map((b) => b.taskId))];
    const tasks = await prisma.task.findMany({ where: { id: { in: ids }, userId: req.userId! } });
    if (tasks.length !== ids.length) return res.status(400).json({ error: "One or more tasks do not belong to this user." });

    const normalized = input.blocks.map((b) => ({ ...b, start: new Date(b.startAt), end: new Date(b.endAt) }));
    for (const b of normalized) {
      if (b.end <= b.start) return res.status(400).json({ error: "Each endAt must be after startAt." });
    }
    for (let i = 0; i < normalized.length; i++) {
      for (let j = i + 1; j < normalized.length; j++) {
        if (normalized[i].start < normalized[j].end && normalized[i].end > normalized[j].start) {
          return res.status(409).json({ error: "Suggested blocks overlap each other." });
        }
      }
    }

    const saved = await prisma.$transaction(async (tx) => {
      const created = [];
      for (const b of normalized) {
        const conflict = await tx.scheduleBlock.findFirst({
          where: { userId: req.userId!, startAt: { lt: b.end }, endAt: { gt: b.start } }
        });
        if (conflict) throw Object.assign(new Error("A saved schedule block overlaps this plan."), { statusCode: 409 });
        const task = tasks.find((t) => t.id === b.taskId)!;
        created.push(await tx.scheduleBlock.create({
          data: { title: task.title, startAt: b.start, endAt: b.end, userId: req.userId!, taskId: task.id }
        }));
      }
      return created;
    });
    return res.status(201).json({ blocks: saved });
  } catch (error) {
    if (error instanceof Error && "statusCode" in error && (error as Error & {statusCode:number}).statusCode === 409) {
      return res.status(409).json({ error: error.message });
    }
    next(error);
  }
});

export default router;
