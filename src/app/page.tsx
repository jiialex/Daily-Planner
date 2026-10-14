import React from 'react';
import AppLayout from '@/components/AppLayout';
import AIRescheduleBanner from './components/AIRescheduleBanner';
import TodayTimeline from './components/TodayTimeline';
import WeeklyCompletionChart from './components/WeeklyCompletionChart';
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

const UpcomingDeadlinesTable = () => (
  <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-base font-semibold text-foreground">Upcoming Deadlines</h2>
      <span className="text-xs text-muted-foreground">Next 7 days</span>
    </div>
    <p className="text-sm text-muted-foreground">No upcoming deadlines available yet.</p>
  </section>
);

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
  return (
    <AppLayout currentPath="/">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Schedule Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Tuesday, 13 October 2026 — Week 42</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="input-field py-2 text-sm h-9 w-auto pr-8">
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
          </select>
          <button className="btn-primary flex items-center gap-1.5 h-9">
            <span>+ Add Task</span>
          </button>
        </div>
      </div>

      {/* AI Reschedule Banner */}
      <AIRescheduleBanner />

      {/* KPI Bento Grid */}
      <KPIBentoGrid />

      {/* Mid section: Timeline + Weekly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-5 mt-5">
        <div className="lg:col-span-3 xl:col-span-3 2xl:col-span-3">
          <TodayTimeline />
        </div>
        <div className="lg:col-span-2 xl:col-span-2 2xl:col-span-2">
          <WeeklyCompletionChart />
        </div>
      </div>

      {/* Bottom section: Workload + Deadlines + Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-5 mt-5">
        <div className="lg:col-span-1">
          <DailyWorkloadChart />
        </div>
        <div className="lg:col-span-1">
          <UpcomingDeadlinesTable />
        </div>
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
      </div>
    </AppLayout>
  );
}