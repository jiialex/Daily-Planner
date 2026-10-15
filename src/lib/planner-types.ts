export const taskStatuses = [
  'pending',
  'scheduled',
  'in-progress',
  'completed',
  'missed',
  'rescheduled',
  'upcoming',
] as const;

export const taskPriorities = ['critical', 'high', 'medium', 'low'] as const;

export type TaskStatus = (typeof taskStatuses)[number];
export type TaskPriority = (typeof taskPriorities)[number];

export interface Task {
  id: string;
  title: string;
  goal: string;
  goalId: string;
  priority: TaskPriority;
  status: TaskStatus;
  estimatedDuration: string;
  scheduledDate: string;
  scheduledTime: string;
  deadline: string;
  dependency: string | null;
  aiSuggested: boolean;
  notes: string;
}

export interface Goal {
  id: string;
  title: string;
  category: string;
  deadline: string | null;
  totalTasks: number;
  completedTasks: number;
}
