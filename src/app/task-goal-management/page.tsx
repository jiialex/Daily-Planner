import React from 'react';
import AppLayout from '@/components/AppLayout';
import GoalsPanel from './components/GoalsPanel';
import TaskTableSection from './components/TaskTableSector';

export default function TaskGoalManagementPage() {
  return (
    <AppLayout currentPath="/task-goal-management">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Tasks & Goals</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your goals, tasks, priorities, and deadlines</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-5">
        {/* Goals panel */}
        <div className="lg:col-span-1 xl:col-span-1 2xl:col-span-1">
          <GoalsPanel />
        </div>

        {/* Task table */}
        <div className="lg:col-span-3 xl:col-span-3 2xl:col-span-3">
          <TaskTableSection />
        </div>
      </div>
    </AppLayout>
  );
}