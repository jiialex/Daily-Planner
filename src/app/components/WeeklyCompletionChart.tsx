'use client';

import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

const weeklyData = [
  { day: 'Tue 7', completion: 82, target: 80 },
  { day: 'Wed 8', completion: 91, target: 80 },
  { day: 'Thu 9', completion: 74, target: 80 },
  { day: 'Fri 10', completion: 58, target: 80 },
  { day: 'Sat 11', completion: 43, target: 80 },
  { day: 'Sun 12', completion: 61, target: 80 },
  { day: 'Mon 13', completion: 68, target: 80 },
];

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const val = payload[0]?.value ?? 0;
  return (
    <div className="bg-card border border-border rounded-xl shadow-elevated px-3.5 py-2.5">
      <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
      <p className="text-sm font-bold text-primary tabular-nums">{val}% completed</p>
      {val < 80 && <p className="text-xs text-danger mt-0.5">Below 80% target</p>}
      {val >= 80 && <p className="text-xs text-success mt-0.5">Above target ✓</p>}
    </div>
  );
}

export default function WeeklyCompletionChart() {
  return (
    <div className="card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h2 className="text-base font-semibold text-foreground">Weekly Task Completion</h2>
          <p className="text-xs text-muted-foreground mt-0.5">7-day rolling · 80% target line</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            Actual
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-2.5 h-px bg-danger" />
            Target
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-[200px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={weeklyData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="completionGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={80} stroke="var(--danger)" strokeDasharray="4 3" strokeWidth={1.5} />
            <Area
              type="monotone"
              dataKey="completion"
              stroke="var(--primary)"
              strokeWidth={2.5}
              fill="url(#completionGrad)"
              dot={{ fill: 'var(--primary)', r: 3.5, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: 'var(--primary)', strokeWidth: 2, stroke: 'var(--card)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
        {[
          { label: 'Avg this week', value: '68%', color: 'text-primary' },
          { label: 'Best day', value: '91%', color: 'text-success' },
          { label: 'Below target', value: '3 days', color: 'text-danger' },
        ].map((stat) => (
          <div key={`stat-${stat.label}`} className="text-center">
            <p className={`text-base font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}