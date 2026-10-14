import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface ActivityItem {
  id: string;
  type: 'ai-reschedule' | 'task-complete' | 'task-missed' | 'goal-created' | 'deadline-alert';
  title: string;
  description: string;
  time: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

const activities: ActivityItem[] = [
  { id: 'act-001', type: 'ai-reschedule', title: 'AI Rescheduled 2 Tasks', description: 'Data Structures session moved to today 14:00', time: '11:14', icon: 'SparklesIcon', iconBg: 'bg-info-bg', iconColor: 'text-info' },
  { id: 'act-002', type: 'task-complete', title: 'Task Completed', description: 'Algorithm Design Lecture Notes — 1h 45m', time: '10:12', icon: 'CheckCircleIcon', iconBg: 'bg-success-bg', iconColor: 'text-success' },
  { id: 'act-003', type: 'deadline-alert', title: 'Deadline Alert', description: 'Database Exam in 4 days — 6 tasks remaining', time: '09:00', icon: 'BellAlertIcon', iconBg: 'bg-danger-bg', iconColor: 'text-danger' },
  { id: 'act-004', type: 'task-complete', title: 'Task Completed', description: 'Data Structures — Linked Lists — 2h', time: '08:03', icon: 'CheckCircleIcon', iconBg: 'bg-success-bg', iconColor: 'text-success' },
  { id: 'act-005', type: 'task-missed', title: 'Task Missed', description: 'Morning Review was not started on time', time: 'Yesterday', icon: 'ExclamationCircleIcon', iconBg: 'bg-warning-bg', iconColor: 'text-warning' },
  { id: 'act-006', type: 'goal-created', title: 'Goal Created', description: 'Operating Systems Exam Prep — 11 tasks added', time: 'Yesterday', icon: 'FlagIcon', iconBg: 'bg-secondary', iconColor: 'text-primary' },
  { id: 'act-007', type: 'ai-reschedule', title: 'AI Proposal Accepted', description: 'SE Project tasks redistributed across 3 days', time: '12 Oct', icon: 'SparklesIcon', iconBg: 'bg-info-bg', iconColor: 'text-info' },
];

export default function ActivityFeed() {
  return (
    <div className="card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Recent Activity</h2>
          <p className="text-xs text-muted-foreground mt-0.5">AI actions & task updates</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto scrollbar-thin">
        {activities.map((item) => (
          <div key={item.id} className="flex gap-3 group">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${item.iconBg}`}>
              <Icon
                name={item.icon as Parameters<typeof Icon>[0]['name']}
                size={15}
                className={item.iconColor}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1">
                <p className="text-sm font-medium text-foreground leading-tight">{item.title}</p>
                <span className="text-xs text-muted-foreground flex-shrink-0 tabular-nums">{item.time}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}