'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import Badge from '@/components/ui/Badge';

interface TimeBlock {
  id: string;
  time: string;
  endTime: string;
  title: string;
  goal: string;
  duration: string;
  status: 'completed' | 'in-progress' | 'upcoming' | 'missed' | 'blocked';
  priority: 'high' | 'medium' | 'low';
  type: 'study' | 'meeting' | 'break' | 'personal' | 'work';
}

const timelineBlocks: TimeBlock[] = [
  { id: 'block-001', time: '07:00', endTime: '08:00', title: 'Morning Review & Planning', goal: 'Daily Routine', duration: '1h', status: 'completed', priority: 'medium', type: 'personal' },
  { id: 'block-002', time: '08:00', endTime: '10:00', title: 'Data Structures — Linked Lists', goal: 'Database Exam Prep', duration: '2h', status: 'completed', priority: 'high', type: 'study' },
  { id: 'block-003', time: '10:00', endTime: '10:15', title: 'Short Break', goal: '', duration: '15m', status: 'completed', priority: 'low', type: 'break' },
  { id: 'block-004', time: '10:15', endTime: '12:00', title: 'Algorithm Design Lecture Notes', goal: 'Database Exam Prep', duration: '1h 45m', status: 'completed', priority: 'high', type: 'study' },
  { id: 'block-005', time: '12:00', endTime: '13:00', title: 'Lunch Break', goal: '', duration: '1h', status: 'completed', priority: 'low', type: 'break' },
  { id: 'block-006', time: '13:00', endTime: '14:30', title: 'Software Engineering Assignment', goal: 'SE Project — Phase 2', duration: '1h 30m', status: 'in-progress', priority: 'high', type: 'work' },
  { id: 'block-007', time: '14:30', endTime: '14:45', title: 'Break', goal: '', duration: '15m', status: 'upcoming', priority: 'low', type: 'break' },
  { id: 'block-008', time: '14:45', endTime: '16:45', title: 'Data Structures Study Session ✦ Rescheduled', goal: 'Database Exam Prep', duration: '2h', status: 'upcoming', priority: 'high', type: 'study' },
  { id: 'block-009', time: '17:00', endTime: '18:00', title: 'Team Project Meeting', goal: 'SE Project — Phase 2', duration: '1h', status: 'upcoming', priority: 'medium', type: 'meeting' },
  { id: 'block-010', time: '19:00', endTime: '20:30', title: 'OS Chapter 4 Review', goal: 'Operating Systems Exam', duration: '1h 30m', status: 'upcoming', priority: 'high', type: 'study' },
  { id: 'block-011', time: '20:30', endTime: '21:00', title: 'Evening Wrap-up', goal: 'Daily Routine', duration: '30m', status: 'upcoming', priority: 'low', type: 'personal' },
];

const statusConfig = {
  completed: { badge: 'success' as const, dot: 'bg-success', line: 'bg-success/30', opacity: 'opacity-70' },
  'in-progress': { badge: 'info' as const, dot: 'bg-info animate-pulse', line: 'bg-info/40', opacity: '' },
  upcoming: { badge: 'neutral' as const, dot: 'bg-border', line: 'bg-border', opacity: '' },
  missed: { badge: 'danger' as const, dot: 'bg-danger', line: 'bg-danger/30', opacity: '' },
  blocked: { badge: 'warning' as const, dot: 'bg-warning', line: 'bg-warning/30', opacity: '' },
};

const typeColors: Record<TimeBlock['type'], string> = {
  study: 'border-l-primary',
  meeting: 'border-l-info',
  break: 'border-l-border',
  personal: 'border-l-success',
  work: 'border-l-warning',
};

export default function TodayTimeline() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="card p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Today&apos;s Schedule</h2>
          <p className="text-xs text-muted-foreground mt-0.5">13 Oct 2026 · 11 blocks · 7.5h planned</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="info" dot>In Progress</Badge>
          <button className="btn-ghost p-1.5">
            <Icon name="AdjustmentsHorizontalIcon" size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-1 max-h-[480px] overflow-y-auto scrollbar-thin pr-1">
        {timelineBlocks.map((block) => {
          const cfg = statusConfig[block.status];
          const isHovered = hoveredId === block.id;
          const isBreak = block.type === 'break';

          if (isBreak) {
            return (
              <div key={block.id} className="flex items-center gap-3 py-1.5 px-2">
                <span className="text-xs text-muted-foreground w-10 flex-shrink-0 tabular-nums">{block.time}</span>
                <div className="flex-1 border-t border-dashed border-border" />
                <span className="text-xs text-muted-foreground flex-shrink-0">{block.duration} break</span>
              </div>
            );
          }

          return (
            <div
              key={block.id}
              className={`flex gap-3 rounded-xl p-3 cursor-pointer transition-all duration-150 ${
                isHovered ? 'bg-muted/60' : 'hover:bg-muted/40'
              } ${cfg.opacity}`}
              onMouseEnter={() => setHoveredId(block.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Time */}
              <div className="flex-shrink-0 w-10 text-right">
                <span className="text-xs text-muted-foreground tabular-nums">{block.time}</span>
              </div>

              {/* Timeline dot + line */}
              <div className="flex flex-col items-center flex-shrink-0 pt-1">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                <div className={`w-px flex-1 mt-1 min-h-[24px] ${cfg.line}`} />
              </div>

              {/* Content */}
              <div className={`flex-1 min-w-0 border-l-2 pl-3 pb-1 ${typeColors[block.type]}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium text-foreground leading-tight ${block.title.includes('✦') ? 'text-info' : ''}`}>
                      {block.title}
                    </p>
                    {block.goal && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{block.goal}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-xs text-muted-foreground tabular-nums">{block.duration}</span>
                    <Badge variant={cfg.badge}>
                      {block.status === 'in-progress' ? 'Active' : block.status.charAt(0).toUpperCase() + block.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                {isHovered && block.status !== 'completed' && (
                  <div className="flex items-center gap-2 mt-2 fade-in">
                    <button className="text-xs text-primary font-medium hover:underline">Start</button>
                    <span className="text-border">·</span>
                    <button className="text-xs text-muted-foreground hover:text-foreground">Postpone</button>
                    <span className="text-border">·</span>
                    <button className="text-xs text-muted-foreground hover:text-foreground">Skip</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}