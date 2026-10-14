'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import Badge from '@/components/ui/Badge';

interface Goal {
  id: string;
  title: string;
  category: string;
  deadline: string;
  daysLeft: number;
  totalTasks: number;
  completedTasks: number;
  risk: 'on-track' | 'at-risk' | 'critical';
  color: string;
}

const goals: Goal[] = [
  { id: 'goal-001', title: 'Database Exam Prep', category: 'Academic', deadline: '17 Oct', daysLeft: 4, totalTasks: 14, completedTasks: 5, risk: 'critical', color: 'bg-danger' },
  { id: 'goal-002', title: 'SE Project Phase 2', category: 'Academic', deadline: '20 Oct', daysLeft: 7, totalTasks: 9, completedTasks: 5, risk: 'at-risk', color: 'bg-warning' },
  { id: 'goal-003', title: 'Operating Systems Exam', category: 'Academic', deadline: '24 Oct', daysLeft: 11, totalTasks: 12, completedTasks: 5, risk: 'at-risk', color: 'bg-warning' },
  { id: 'goal-004', title: 'Algorithms Course', category: 'Academic', deadline: '28 Oct', daysLeft: 15, totalTasks: 8, completedTasks: 6, risk: 'on-track', color: 'bg-success' },
  { id: 'goal-005', title: 'Research Paper Draft', category: 'Academic', deadline: '05 Nov', daysLeft: 23, totalTasks: 7, completedTasks: 2, risk: 'on-track', color: 'bg-primary' },
  { id: 'goal-006', title: 'Daily Fitness Habit', category: 'Personal', deadline: 'Ongoing', daysLeft: 999, totalTasks: 30, completedTasks: 18, risk: 'on-track', color: 'bg-info' },
];

const riskBadge: Record<Goal['risk'], { variant: 'danger' | 'warning' | 'success'; label: string }> = {
  critical: { variant: 'danger', label: 'Critical' },
  'at-risk': { variant: 'warning', label: 'At Risk' },
  'on-track': { variant: 'success', label: 'On Track' },
};

export default function GoalsPanel() {
  const [selectedGoalId, setSelectedGoalId] = useState<string>('goal-001');

  return (
    <div className="card p-4 sticky top-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-foreground">Active Goals</h2>
        <span className="text-xs text-muted-foreground tabular-nums">{goals.length} goals</span>
      </div>

      <div className="space-y-2">
        {goals.map((goal) => {
          const pct = Math.round((goal.completedTasks / goal.totalTasks) * 100);
          const rb = riskBadge[goal.risk];
          const isSelected = selectedGoalId === goal.id;

          return (
            <div
              key={goal.id}
              onClick={() => setSelectedGoalId(goal.id)}
              className={`rounded-xl p-3 cursor-pointer transition-all duration-150 border ${
                isSelected
                  ? 'border-primary/30 bg-secondary' :'border-transparent hover:border-border hover:bg-muted/40'
              }`}
            >
              <div className="flex items-start gap-2 mb-2">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${goal.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-tight truncate">{goal.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-muted-foreground">{goal.category}</span>
                    {goal.daysLeft < 999 && (
                      <>
                        <span className="text-border text-xs">·</span>
                        <span className={`text-xs font-medium tabular-nums ${
                          goal.daysLeft <= 4 ? 'text-danger' : goal.daysLeft <= 10 ? 'text-warning' : 'text-muted-foreground'
                        }`}>{goal.daysLeft}d left</span>
                      </>
                    )}
                  </div>
                </div>
                <Badge variant={rb.variant}>{rb.label}</Badge>
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{goal.completedTasks}/{goal.totalTasks} tasks</span>
                  <span className="text-xs font-semibold tabular-nums text-foreground">{pct}%</span>
                </div>
                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${goal.color}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'summary-total', label: 'Total tasks', value: goals.reduce((s, g) => s + g.totalTasks, 0).toString() },
            { key: 'summary-done', label: 'Completed', value: goals.reduce((s, g) => s + g.completedTasks, 0).toString() },
          ].map((s) => (
            <div key={s.key} className="bg-muted rounded-xl p-2.5 text-center">
              <p className="text-base font-bold text-foreground tabular-nums">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <button className="btn-secondary w-full mt-3 text-sm h-9 flex items-center justify-center gap-1.5">
        <Icon name="PlusIcon" size={15} />
        Add Goal
      </button>
    </div>
  );
}