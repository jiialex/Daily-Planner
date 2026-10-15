import type { Goal, Task, TaskPriority, TaskStatus } from '@/lib/planner-types';
import { isRecord } from '@/lib/backend-api';

interface BackendGoal {
  id: string;
  title: string;
  category: string;
  targetDate: string | null;
  totalTasks?: number;
  completedTasks?: number;
}

interface BackendTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueAt: string | null;
  estimatedMinutes: number;
  scheduledDate: string | null;
  scheduledTime: string | null;
  description: string | null;
  goalId: string | null;
  goal: { id: string; title: string } | null;
  dependencyId: string | null;
}

const backendPriorities: Record<TaskPriority, string> = {
  critical: 'URGENT',
  high: 'HIGH',
  medium: 'MEDIUM',
  low: 'LOW',
};

const backendStatuses: Record<TaskStatus, string> = {
  pending: 'PENDING',
  scheduled: 'SCHEDULED',
  'in-progress': 'IN_PROGRESS',
  completed: 'COMPLETED',
  missed: 'MISSED',
  rescheduled: 'RESCHEDULED',
  upcoming: 'UPCOMING',
};

function getDate(value: string | null): string {
  return value ? value.slice(0, 10) : '';
}

function dateAtEndOfDay(value: unknown, label: string): string | null {
  if (value === '' || value === null) return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Enter a valid ${label}.`);
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error(`Enter a valid ${label}.`);
  }
  return `${value}T23:59:59.999Z`;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours ? `${hours}h` : ''}${hours && remainingMinutes ? ' ' : ''}${remainingMinutes ? `${remainingMinutes}m` : ''}`;
}

export function toFrontendGoal(value: unknown): Goal {
  const goal = value as BackendGoal;
  return {
    id: goal.id,
    title: goal.title,
    category: goal.category || 'Personal',
    deadline: goal.targetDate ? getDate(goal.targetDate) : null,
    totalTasks: goal.totalTasks ?? 0,
    completedTasks: goal.completedTasks ?? 0,
  };
}

export function toFrontendTask(value: unknown): Task {
  const task = value as BackendTask;
  const priority = task.priority === 'URGENT' ? 'critical' : task.priority.toLowerCase();
  const status = task.status.toLowerCase().replaceAll('_', '-');

  return {
    id: task.id,
    title: task.title,
    goal: task.goal?.title ?? '',
    goalId: task.goalId ?? '',
    priority: priority as TaskPriority,
    status: status as TaskStatus,
    estimatedDuration: formatDuration(task.estimatedMinutes),
    scheduledDate: task.scheduledDate ?? '',
    scheduledTime: task.scheduledTime ?? '',
    deadline: getDate(task.dueAt),
    dependency: task.dependencyId,
    aiSuggested: false,
    notes: task.description ?? '',
  };
}

function durationInMinutes(value: unknown): number {
  if (typeof value !== 'string') throw new Error('Choose an estimated duration.');
  const match = value.trim().match(/^(?:(\d+)h)?(?:\s*(\d+)m)?$/);
  if (!match || (!match[1] && !match[2])) throw new Error('Choose a valid estimated duration.');
  const minutes = Number(match[1] ?? 0) * 60 + Number(match[2] ?? 0);
  if (minutes < 5 || minutes > 720) throw new Error('Estimated duration must be between 5 minutes and 12 hours.');
  return minutes;
}

export function toBackendTaskInput(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) throw new Error('Task data must be an object.');
  const allowed = new Set([
    'title', 'goalId', 'priority', 'status', 'estimatedDuration',
    'deadline', 'scheduledDate', 'scheduledTime', 'dependency', 'notes',
  ]);
  if (Object.keys(value).some((key) => !allowed.has(key))) {
    throw new Error('The task update contains an unsupported field.');
  }
  const result: Record<string, unknown> = {};

  if ('title' in value) result.title = value.title;
  if ('goalId' in value) result.goalId = value.goalId || null;
  if ('priority' in value) {
    const priority = value.priority;
    if (typeof priority !== 'string' || !Object.hasOwn(backendPriorities, priority)) {
      throw new Error('Choose a valid priority.');
    }
    result.priority = backendPriorities[priority as TaskPriority];
  }
  if ('status' in value) {
    const status = value.status;
    if (typeof status !== 'string' || !Object.hasOwn(backendStatuses, status)) {
      throw new Error('Choose a valid task status.');
    }
    result.status = backendStatuses[status as TaskStatus];
  }
  if ('estimatedDuration' in value) result.estimatedMinutes = durationInMinutes(value.estimatedDuration);
  if ('deadline' in value) result.dueAt = dateAtEndOfDay(value.deadline, 'deadline');
  if ('scheduledDate' in value) {
    const scheduledDate = value.scheduledDate === '' ? null : value.scheduledDate;
    if (scheduledDate !== null && (typeof scheduledDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate))) {
      throw new Error('Enter a valid scheduled date.');
    }
    if (typeof scheduledDate === 'string') dateAtEndOfDay(scheduledDate, 'scheduled date');
    result.scheduledDate = scheduledDate;
  }
  if ('scheduledTime' in value) result.scheduledTime = value.scheduledTime || null;
  if ('dependency' in value) result.dependencyId = value.dependency || null;
  if ('notes' in value) result.description = value.notes;

  return result;
}

export function toBackendGoalInput(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) throw new Error('Goal data must be an object.');
  const allowed = new Set(['title', 'category', 'deadline']);
  if (Object.keys(value).some((key) => !allowed.has(key))) {
    throw new Error('The goal update contains an unsupported field.');
  }
  const result: Record<string, unknown> = {};

  if ('title' in value) result.title = value.title;
  if ('category' in value) result.category = value.category;
  if ('deadline' in value) result.targetDate = dateAtEndOfDay(value.deadline, 'goal deadline');

  return result;
}
