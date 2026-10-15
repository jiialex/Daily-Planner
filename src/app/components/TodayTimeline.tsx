'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';

interface TimeBlock {
  id: string;
  taskId: string | null;
  time: string;
  endTime: string;
  title: string;
  goal: string;
  duration: string;
  status: 'completed' | 'in-progress' | 'upcoming' | 'missed';
  priority: 'high' | 'medium' | 'low';
}

interface BackendBlock {
  id: string;
  taskId: string | null;
  title: string;
  startAt: string;
  endAt: string;
  task: {
    status: string;
    priority: string;
    goal: { title: string } | null;
  } | null;
}

type DashboardRange = 'today' | 'week' | 'month';

const statusConfig = {
  completed: { badge: 'success' as const, dot: 'bg-success', line: 'bg-success/30', opacity: 'opacity-70' },
  'in-progress': { badge: 'info' as const, dot: 'bg-info animate-pulse', line: 'bg-info/40', opacity: '' },
  upcoming: { badge: 'neutral' as const, dot: 'bg-border', line: 'bg-border', opacity: '' },
  missed: { badge: 'danger' as const, dot: 'bg-danger', line: 'bg-danger/30', opacity: '' },
};

function localDayStart() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start;
}

function asTime(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function durationInMinutes(duration: string) {
  const match = duration.match(/^(?:(\d+)h)?(?:\s*(\d+)m)?$/);
  return match ? Number(match[1] ?? 0) * 60 + Number(match[2] ?? 0) : 0;
}

function mapBlock(block: BackendBlock): TimeBlock {
  const status = block.task?.status;
  const priority = block.task?.priority;
  const minutes = Math.max(0, Math.round((Date.parse(block.endAt) - Date.parse(block.startAt)) / 60_000));

  return {
    id: block.id,
    taskId: block.taskId,
    time: asTime(block.startAt),
    endTime: asTime(block.endAt),
    title: block.title,
    goal: block.task?.goal?.title ?? '',
    duration: minutes >= 60 && minutes % 60 === 0
      ? `${minutes / 60}h`
      : minutes >= 60
        ? `${Math.floor(minutes / 60)}h ${minutes % 60}m`
        : `${minutes}m`,
    status: status === 'COMPLETED'
      ? 'completed'
      : status === 'IN_PROGRESS'
        ? 'in-progress'
        : status === 'MISSED'
          ? 'missed'
          : 'upcoming',
    priority: priority === 'URGENT' || priority === 'HIGH' ? 'high' : priority === 'LOW' ? 'low' : 'medium',
  };
}

export default function TodayTimeline({ range = 'today' }: { range?: DashboardRange }) {
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);

  const loadSchedule = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    const today = localDayStart();
    const start = new Date(today);
    const end = new Date(today);
    if (range === 'week') {
      start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
      end.setTime(start.getTime());
      end.setDate(end.getDate() + 7);
    } else if (range === 'month') {
      start.setDate(1);
      end.setFullYear(start.getFullYear(), start.getMonth() + 1, 1);
    } else {
      end.setDate(end.getDate() + 1);
    }
    const query = new URLSearchParams({ start: start.toISOString(), end: end.toISOString() });

    try {
      const response = await fetch(`/api/schedule?${query}`, { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to load today’s schedule.');
      setBlocks((result.blocks as BackendBlock[]).map(mapBlock));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load today’s schedule.';
      setLoadError(message);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    void loadSchedule();
    window.addEventListener('planwise:schedule-updated', loadSchedule);
    return () => window.removeEventListener('planwise:schedule-updated', loadSchedule);
  }, [loadSchedule]);

  const updateTaskStatus = async (block: TimeBlock, status: 'in-progress' | 'missed') => {
    if (!block.taskId) return;
    setActionId(block.id);
    try {
      const response = await fetch(`/api/tasks/${encodeURIComponent(block.taskId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to update this task.');
      toast.success(status === 'missed' ? 'Task marked as missed.' : 'Task started.');
      await loadSchedule();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update this task.');
    } finally {
      setActionId(null);
    }
  };

  const postponeBlock = async (block: TimeBlock) => {
    setActionId(block.id);
    try {
      const response = await fetch(`/api/schedule/${encodeURIComponent(block.id)}`, { method: 'DELETE' });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Unable to remove this schedule block.');
      }
      toast.success('Schedule block postponed.');
      await loadSchedule();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to postpone this block.');
    } finally {
      setActionId(null);
    }
  };

  const totalMinutes = blocks.reduce((sum, block) => sum + durationInMinutes(block.duration), 0);

  return (
    <div className="card p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {range === 'today' ? "Today's Schedule" : range === 'week' ? "This Week's Schedule" : "This Month's Schedule"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {range === 'today'
              ? new Date().toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })
              : range === 'week' ? 'Monday–Sunday' : new Date().toLocaleDateString([], { month: 'long', year: 'numeric' })}
            {' · '}{blocks.length} block{blocks.length === 1 ? '' : 's'} · {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m planned
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {blocks.some((block) => block.status === 'in-progress') && <Badge variant="info" dot>In Progress</Badge>}
          <button onClick={() => void loadSchedule()} disabled={loading} className="btn-ghost p-1.5" aria-label="Refresh schedule">
            <Icon name="ArrowPathIcon" size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Loading schedule…</p>
      ) : loadError ? (
        <div className="py-8 text-center">
          <p className="text-sm text-danger">{loadError}</p>
          <button onClick={() => void loadSchedule()} className="btn-secondary mt-3 text-sm">Try again</button>
        </div>
      ) : blocks.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No saved schedule blocks for this {range === 'today' ? 'day' : range}. Generate a plan above to get started.
        </p>
      ) : (
        <div className="space-y-1 max-h-[480px] overflow-y-auto scrollbar-thin pr-1">
          {blocks.map((block) => {
            const cfg = statusConfig[block.status];
            const isHovered = hoveredId === block.id;
            const busy = actionId === block.id;

            return (
              <div
                key={block.id}
                className={`flex gap-3 rounded-xl p-3 transition-all duration-150 ${isHovered ? 'bg-muted/60' : 'hover:bg-muted/40'} ${cfg.opacity}`}
                onMouseEnter={() => setHoveredId(block.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="flex-shrink-0 w-12 text-right">
                  <span className="text-xs text-muted-foreground tabular-nums">{block.time}</span>
                </div>
                <div className="flex flex-col items-center flex-shrink-0 pt-1">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                  <div className={`w-px flex-1 mt-1 min-h-[24px] ${cfg.line}`} />
                </div>
                <div className="flex-1 min-w-0 border-l-2 border-l-primary pl-3 pb-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground leading-tight">{block.title}</p>
                      {block.goal && <p className="text-xs text-muted-foreground mt-0.5 truncate">{block.goal}</p>}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-xs text-muted-foreground tabular-nums">{block.duration}</span>
                      <Badge variant={cfg.badge}>
                        {block.status === 'in-progress' ? 'Active' : block.status.charAt(0).toUpperCase() + block.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  {isHovered && block.status !== 'completed' && (
                    <div className="flex items-center gap-2 mt-2">
                      {block.taskId && block.status !== 'in-progress' && (
                        <button disabled={busy} onClick={() => void updateTaskStatus(block, 'in-progress')} className="text-xs text-primary font-medium hover:underline disabled:opacity-50">
                          Start
                        </button>
                      )}
                      {block.taskId && block.status !== 'missed' && (
                        <>
                          <span className="text-border">·</span>
                          <button disabled={busy} onClick={() => void updateTaskStatus(block, 'missed')} className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50">
                            Skip
                          </button>
                        </>
                      )}
                      <span className="text-border">·</span>
                      <button disabled={busy} onClick={() => void postponeBlock(block)} className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50">
                        Postpone
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
