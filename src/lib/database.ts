import 'server-only';

import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Goal, Task } from './planner-types';

const goalSeeds = [
  ['goal-001', 'Database Exam Prep', 'Academic', '2026-10-17'],
  ['goal-002', 'SE Project Phase 2', 'Academic', '2026-10-20'],
  ['goal-003', 'Operating Systems Exam', 'Academic', '2026-10-24'],
  ['goal-004', 'Algorithms Course', 'Academic', '2026-10-28'],
  ['goal-005', 'Research Paper Draft', 'Academic', '2026-11-05'],
  ['goal-006', 'Daily Fitness Habit', 'Personal', null],
] as const;

const taskSeeds = [
  ['task-001', 'Linked Lists — Theory & Notes', 'goal-001', 'critical', 'completed', '2h', '2026-10-13', '08:00', '2026-10-17', null, 1],
  ['task-002', 'Algorithm Design Lecture Review', 'goal-001', 'high', 'completed', '1h 45m', '2026-10-13', '10:15', '2026-10-17', 'task-001', 1],
  ['task-003', 'Data Structures Study Session ✦', 'goal-001', 'critical', 'rescheduled', '2h', '2026-10-13', '14:45', '2026-10-17', 'task-002', 1],
  ['task-004', 'Practice Quiz Set A', 'goal-001', 'high', 'rescheduled', '1h', '2026-10-14', '07:00', '2026-10-17', 'task-003', 1],
  ['task-005', 'SE Project Architecture Diagram', 'goal-002', 'high', 'in-progress', '1h 30m', '2026-10-13', '13:00', '2026-10-20', null, 0],
  ['task-006', 'Team Project Meeting Prep', 'goal-002', 'medium', 'upcoming', '30m', '2026-10-13', '16:30', '2026-10-20', 'task-005', 0],
  ['task-007', 'OS Chapter 4 — Process Management', 'goal-003', 'high', 'scheduled', '1h 30m', '2026-10-13', '19:00', '2026-10-24', null, 1],
  ['task-008', 'OS Chapter 5 — Memory Management', 'goal-003', 'high', 'pending', '2h', '2026-10-14', '09:00', '2026-10-24', 'task-007', 1],
  ['task-009', 'Sorting Algorithms — Big-O Analysis', 'goal-004', 'medium', 'completed', '1h', '2026-10-12', '14:00', '2026-10-28', null, 0],
  ['task-010', 'Graph Traversal Problem Set', 'goal-004', 'medium', 'scheduled', '1h 30m', '2026-10-15', '10:00', '2026-10-28', 'task-009', 0],
  ['task-011', 'Research Paper Outline', 'goal-005', 'medium', 'missed', '45m', '2026-10-11', '20:00', '2026-11-05', null, 0],
  ['task-012', 'Literature Review Section', 'goal-005', 'low', 'pending', '2h', '2026-10-16', '18:00', '2026-11-05', 'task-011', 0],
] as const;

const dbFile = process.env.PLANWISE_DB_PATH || path.join(process.cwd(), 'data', 'planwise.sqlite');
mkdirSync(path.dirname(dbFile), { recursive: true });

const globalForDatabase = globalThis as typeof globalThis & {
  planWiseDatabase?: Database.Database;
};

const db =
  globalForDatabase.planWiseDatabase ??
  new Database(dbFile);

if (process.env.NODE_ENV !== 'production') {
  globalForDatabase.planWiseDatabase = db;
}

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(`
  CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    deadline TEXT
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    goal_id TEXT NOT NULL REFERENCES goals(id) ON DELETE RESTRICT,
    priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'scheduled', 'in-progress', 'completed', 'missed', 'rescheduled', 'upcoming')),
    estimated_duration TEXT NOT NULL,
    scheduled_date TEXT NOT NULL DEFAULT '',
    scheduled_time TEXT NOT NULL DEFAULT '',
    deadline TEXT NOT NULL,
    dependency TEXT REFERENCES tasks(id) ON DELETE SET NULL,
    ai_suggested INTEGER NOT NULL DEFAULT 0,
    notes TEXT NOT NULL DEFAULT ''
  );
`);

const seedIfEmpty = db.transaction(() => {
  const goalCount = db.prepare('SELECT COUNT(*) AS count FROM goals').get() as { count: number };
  if (goalCount.count > 0) return;

  const insertGoal = db.prepare(
    'INSERT INTO goals (id, title, category, deadline) VALUES (?, ?, ?, ?)',
  );
  for (const goal of goalSeeds) insertGoal.run(...goal);

  const insertTask = db.prepare(`
    INSERT INTO tasks (
      id, title, goal_id, priority, status, estimated_duration,
      scheduled_date, scheduled_time, deadline, dependency, ai_suggested
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const task of taskSeeds) insertTask.run(...task);
});
seedIfEmpty();

export function listTasks(): Task[] {
  return db.prepare(`
    SELECT
      tasks.id,
      tasks.title,
      goals.title AS goal,
      tasks.goal_id AS goalId,
      tasks.priority,
      tasks.status,
      tasks.estimated_duration AS estimatedDuration,
      tasks.scheduled_date AS scheduledDate,
      tasks.scheduled_time AS scheduledTime,
      tasks.deadline,
      tasks.dependency,
      tasks.ai_suggested AS aiSuggested,
      tasks.notes
    FROM tasks
    INNER JOIN goals ON goals.id = tasks.goal_id
    ORDER BY tasks.scheduled_date, tasks.scheduled_time, tasks.title
  `).all().map((row) => {
    const task = row as Omit<Task, 'aiSuggested'> & { aiSuggested: number };
    return { ...task, aiSuggested: Boolean(task.aiSuggested) };
  });
}

export function listGoals(): Goal[] {
  return db.prepare(`
    SELECT
      goals.id,
      goals.title,
      goals.category,
      goals.deadline,
      COUNT(tasks.id) AS totalTasks,
      SUM(CASE WHEN tasks.status = 'completed' THEN 1 ELSE 0 END) AS completedTasks
    FROM goals
    LEFT JOIN tasks ON tasks.goal_id = goals.id
    GROUP BY goals.id
    ORDER BY goals.title
  `).all().map((row) => {
    const goal = row as Goal & { totalTasks: number | null; completedTasks: number | null };
    return {
      ...goal,
      totalTasks: goal.totalTasks ?? 0,
      completedTasks: goal.completedTasks ?? 0,
    };
  });
}

export function goalExists(id: string): boolean {
  return Boolean(db.prepare('SELECT 1 FROM goals WHERE id = ?').get(id));
}

export function taskExists(id: string): boolean {
  return Boolean(db.prepare('SELECT 1 FROM tasks WHERE id = ?').get(id));
}

export function goalHasTasks(id: string): boolean {
  return Boolean(db.prepare('SELECT 1 FROM tasks WHERE goal_id = ? LIMIT 1').get(id));
}

export function createGoal(input: { title: string; category: string; deadline: string | null }): Goal {
  const id = randomUUID();
  db.prepare('INSERT INTO goals (id, title, category, deadline) VALUES (?, ?, ?, ?)').run(
    id,
    input.title,
    input.category,
    input.deadline,
  );
  return { id, ...input, totalTasks: 0, completedTasks: 0 };
}

export function updateGoal(
  id: string,
  input: Partial<Pick<Goal, 'title' | 'category' | 'deadline'>>,
): Goal | undefined {
  const columns = { title: 'title', category: 'category', deadline: 'deadline' } as const;
  const entries = Object.entries(input) as [keyof typeof input, unknown][];
  if (entries.length > 0) {
    db.prepare(`UPDATE goals SET ${entries.map(([key]) => `${columns[key]} = @${key}`).join(', ')} WHERE id = @id`)
      .run({ ...input, id });
  }
  return listGoals().find((goal) => goal.id === id);
}

export function createTask(input: {
  title: string;
  goalId: string;
  priority: Task['priority'];
  estimatedDuration: string;
  deadline: string;
  scheduledDate: string;
  scheduledTime: string;
  dependency: string | null;
  notes: string;
}): Task | undefined {
  const id = randomUUID();
  db.prepare(`
    INSERT INTO tasks (
      id, title, goal_id, priority, status, estimated_duration,
      deadline, scheduled_date, scheduled_time, dependency, notes
    ) VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    input.title,
    input.goalId,
    input.priority,
    input.estimatedDuration,
    input.deadline,
    input.scheduledDate,
    input.scheduledTime,
    input.dependency,
    input.notes,
  );
  return listTasks().find((task) => task.id === id);
}

export function updateTask(
  id: string,
  input: Partial<Pick<Task, 'title' | 'goalId' | 'priority' | 'status' | 'estimatedDuration' | 'deadline' | 'scheduledDate' | 'scheduledTime' | 'dependency' | 'notes'>>,
): Task | undefined {
  const columns: Record<keyof typeof input, string> = {
    title: 'title',
    goalId: 'goal_id',
    priority: 'priority',
    status: 'status',
    estimatedDuration: 'estimated_duration',
    deadline: 'deadline',
    scheduledDate: 'scheduled_date',
    scheduledTime: 'scheduled_time',
    dependency: 'dependency',
    notes: 'notes',
  };
  const entries = Object.entries(input) as [keyof typeof input, unknown][];
  if (entries.length === 0) return listTasks().find((task) => task.id === id);
  db.prepare(`UPDATE tasks SET ${entries.map(([key]) => `${columns[key]} = @${key}`).join(', ')} WHERE id = @id`)
    .run({ ...input, id });
  return listTasks().find((task) => task.id === id);
}

export function deleteTask(id: string): boolean {
  return db.prepare('DELETE FROM tasks WHERE id = ?').run(id).changes > 0;
}

export function deleteTasks(ids: string[]): number {
  if (ids.length === 0) return 0;
  const placeholders = ids.map(() => '?').join(', ');
  return db.prepare(`DELETE FROM tasks WHERE id IN (${placeholders})`).run(...ids).changes;
}

export function updateTasksStatus(ids: string[], status: Task['status']): number {
  if (ids.length === 0) return 0;
  const placeholders = ids.map(() => '?').join(', ');
  return db.prepare(`UPDATE tasks SET status = ? WHERE id IN (${placeholders})`)
    .run(status, ...ids).changes;
}

export function deleteGoal(id: string): boolean {
  return db.prepare('DELETE FROM goals WHERE id = ?').run(id).changes > 0;
}
