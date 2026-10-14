'use client';

import React from 'react';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/AppIcon';

interface Deadline {
  id: string;
  title: string;
  goal: string;
  dueDate: string;
  daysLeft: number;
  tasksLeft: number;
  risk: 'on-track' | 'at-risk' | 'critical';
  completionPct: number;
}

const deadlines: Deadline[] = [
  { id: 'dl-001', title: 'Database Exam', goal: 'Database Exam Prep', dueDate: '17 Oct', daysLeft: 4, tasksLeft: 6, risk: 'critical', completionPct: 38 },
  { id: 'dl-002', title: 'SE Project Phase 2', goal: 'SE Project', dueDate: '20 Oct', daysLeft: 7, tasksLeft: 4, risk: 'at-risk', completionPct: 55 },
  { id: 'dl-003', title: 'OS Chapter Review', goal: 'Operating Systems Exam', dueDate: '24 Oct', daysLeft: 11, tasksLeft: 8, risk: 'at-risk', completionPct: 40 },
  { id: 'dl-004', title: 'Algorithm Assignment', goal: 'Algorithms Course', dueDate: '28 Oct', daysLeft: 15, tasksLeft: 3, risk: 'on-track', completionPct: 72 },
  { id: 'dl-005', title: 'Research Paper Draft', goal: 'Academic Writing', dueDate: '05 Nov', daysLeft: 23, tasksLeft: 5, risk: 'on-track', completionPct: 28 },
];

const riskBadge: Record<Deadline['risk'], { variant: 'danger' | 'warning' | 'success'; label: string }> = {
  critical: { variant: 'danger', label: 'Critical' },
  'at-risk': { variant: 'warning', label: 'At Risk' },
  'on-track': { variant: 'success', label: 'On Track' },
};

export default function UpcomingDeadlinesTable() {
  return (
    <div className="card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Upcoming Deadlines</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Next 30 days · 5 items</p>
        </div>
        <button className="btn-ghost p-1.5">
          <Icon name="ArrowTopRightOnSquareIcon" size={15} className="text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto scrollbar-thin">
        {deadlines.map((dl) => {
          const rb = riskBadge[dl.risk];
          return (
            <div
              key={dl.id}
              className={`rounded-xl p-3 border transition-all duration-150 hover:shadow-card cursor-pointer ${
                dl.risk === 'critical' ?'border-danger/25 bg-danger-bg/50'
                  : dl.risk === 'at-risk' ?'border-warning/25 bg-warning-bg/50' :'border-border bg-muted/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{dl.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{dl.goal}</p>
                </div>
                <Badge variant={rb.variant} dot>{rb.label}</Badge>
              </div>

              {/* Progress bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{dl.completionPct}% complete</span>
                  <span className="text-xs text-muted-foreground">{dl.tasksLeft} tasks left</span>
                </div>
                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      dl.risk === 'critical' ? 'bg-danger' : dl.risk === 'at-risk' ? 'bg-warning' : 'bg-success'
                    }`}
                    style={{ width: `${dl.completionPct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Due {dl.dueDate}</span>
                <span className={`text-xs font-semibold tabular-nums ${
                  dl.daysLeft <= 4 ? 'text-danger' : dl.daysLeft <= 10 ? 'text-warning' : 'text-muted-foreground'
                }`}>
                  {dl.daysLeft}d left
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}