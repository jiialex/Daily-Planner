'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import AIRescheduleBanner from './components/AIRescheduleBanner';
import TodayTimeline from './components/TodayTimeline';
import WeeklyCompletionChart from './components/WeeklyCompletionChart';
type DashboardRange = 'today' | 'week' | 'month';

function getIsoWeek(date: Date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  target.setUTCDate(target.getUTCDate() + 4 - (target.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(((target.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

const ActivityFeed = () => (
  <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-base font-semibold text-foreground">Activity Feed</h2>
      <span className="text-xs text-muted-foreground">Recent</span>
    </div>
    <p className="text-sm text-muted-foreground">No recent activity available yet.</p>
  </section>
);

const DailyWorkloadChart = () => (
  <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-base font-semibold text-foreground">Daily Workload</h2>
      <span className="text-xs text-muted-foreground">Today</span>
    </div>
    <p className="text-sm text-muted-foreground">No workload data available yet.</p>
  </section>
);

interface DashboardTask {
  id: string;
  title: string;
  deadline: string;
  status: string;
  goal: string;
}

const UpcomingDeadlinesTable = () => {
  const [tasks, setTasks] = useState<DashboardTask[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void fetch('/api/tasks', { cache: 'no-store' })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to load deadlines.');
        if (active) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const end = new Date(today);
          end.setDate(end.getDate() + 7);
          setTasks((result.tasks as DashboardTask[])
            .filter((task) => task.deadline && task.status !== 'completed')
            .filter((task) => {
              const due = new Date(`${task.deadline}T00:00:00`);
              return due < end;
            })
            .sort((first, second) => first.deadline.localeCompare(second.deadline)));
        }
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Unable to load deadlines.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-foreground">Upcoming Deadlines</h2>
        <span className="text-xs text-muted-foreground">Next 7 days</span>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading deadlines…</p>
      ) : error ? (
        <p className="text-sm text-danger">{error}</p>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tasks due in the next 7 days.</p>
      ) : (
        <ul className="space-y-2">
          {tasks.slice(0, 5).map((task) => (
            <li key={task.id}>
              <Link
                href={`/task-goal-management?search=${encodeURIComponent(task.title)}`}
                className="flex items-center justify-between gap-3 rounded-lg p-2 hover:bg-muted"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">{task.title}</span>
                  {task.goal && <span className="block truncate text-xs text-muted-foreground">{task.goal}</span>}
                </span>
                <time dateTime={task.deadline} className="shrink-0 text-xs text-muted-foreground">
                  {new Date(`${task.deadline}T00:00:00`).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

const KPIBentoGrid = () => (
  <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-base font-semibold text-foreground">KPI Overview</h2>
      <span className="text-xs text-muted-foreground">Live</span>
    </div>
    <p className="text-sm text-muted-foreground">No KPI data available yet.</p>
  </section>
);

export default function ScheduleDashboardPage() {
  const router = useRouter();
  const [range, setRange] = useState<DashboardRange>('today');
  const [autoGeneratePlan, setAutoGeneratePlan] = useState(false);
  const now = new Date();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedRange = params.get('range');
    if (requestedRange === 'today' || requestedRange === 'week' || requestedRange === 'month') {
      setRange(requestedRange);
    }
    if (params.get('generate') === '1') {
      setAutoGeneratePlan(true);
    }
    if (params.has('range') || params.has('generate')) {
      params.delete('range');
      params.delete('generate');
      const query = params.toString();
      window.history.replaceState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
    }
    const setDashboardRange = (event: Event) => {
      const requested = (event as CustomEvent<DashboardRange>).detail;
      if (requested === 'today' || requested === 'week' || requested === 'month') setRange(requested);
    };
    window.addEventListener('planwise:set-range', setDashboardRange);
    return () => window.removeEventListener('planwise:set-range', setDashboardRange);
  }, []);

  return (
    <AppLayout currentPath="/">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Schedule Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {' — Week '}{getIsoWeek(now)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={range}
            onChange={(event) => setRange(event.target.value as DashboardRange)}
            className="input-field py-2 text-sm h-9 w-auto pr-8"
            aria-label="Schedule date range"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <button
            type="button"
            onClick={() => router.push('/task-goal-management?addTask=1')}
            className="btn-primary flex items-center gap-1.5 h-9"
          >
            <span>+ Add Task</span>
          </button>
        </div>
      </div>

      {/* AI Reschedule Banner */}
      <div id="planner"><AIRescheduleBanner autoGenerate={autoGeneratePlan} /></div>

      {/* KPI Bento Grid */}
      <KPIBentoGrid />

      {/* Mid section: Timeline + Weekly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-5 mt-5">
        <div id="today-schedule" className="lg:col-span-3 xl:col-span-3 2xl:col-span-3">
          <TodayTimeline range={range} />
        </div>
        <div id="reports" className="lg:col-span-2 xl:col-span-2 2xl:col-span-2">
          <WeeklyCompletionChart />
        </div>
      </div>

      {/* Bottom section: Workload + Deadlines + Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-5 mt-5">
        <div className="lg:col-span-1">
          <DailyWorkloadChart />
        </div>
        <div id="deadlines" className="lg:col-span-1">
          <UpcomingDeadlinesTable />
        </div>
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
      </div>
    </AppLayout>
  );
}