import React from 'react';
import AppLayout from '@/components/AppLayout';
import GoalsPanel from './components/GoalsPanel';

const TaskTablePlaceholder = () => (
  <div className="rounded-lg border border-dashed border-muted bg-card p-4 text-sm text-muted-foreground">
    Task table coming soon
  </div>
);

export default function TaskGoalManagementPage() {
  return (
    <AppLayout currentPath="/task-goal-management">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Tasks & Goals</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your goals, tasks, priorities, and deadlines</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary flex items-center gap-1.5 h-9 text-sm">
            <span>+ New Goal</span>
          </button>
          <button className="btn-primary flex items-center gap-1.5 h-9 text-sm">
            <span>+ Add Task</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-5">
        {/* Goals panel */}
        <div className="lg:col-span-1 xl:col-span-1 2xl:col-span-1">
          <GoalsPanel />
        </div>

        {/* Task table */}
        <div className="lg:col-span-3 xl:col-span-3 2xl:col-span-3">
          <TaskTablePlaceholder />
        </div>
      </div>
    </AppLayout>
  );
}