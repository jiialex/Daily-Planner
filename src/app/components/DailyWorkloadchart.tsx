'use client';

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';

const workloadData = [
  { day: 'Tue', hours: 6.5, capacity: 8 },
  { day: 'Wed', hours: 8.8, capacity: 8 },
  { day: 'Thu', hours: 7.2, capacity: 8 },
  { day: 'Fri', hours: 9.4, capacity: 8 },
  { day: 'Sat', hours: 3.5, capacity: 8 },
  { day: 'Sun', hours: 4.1, capacity: 8 },
  { day: 'Mon', hours: 7.5, capacity: 8 },
];

interface TooltipPayload {
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;

  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const hours = payload[0]?.value ?? 0;
  const overloaded = hours > 8;
  return (
    <div className="bg-card border border-border rounded-xl shadow-elevated px-3.5 py-2.5">
      <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
      <p className={`text-sm font-bold tabular-nums ${overloaded ? 'text-danger' : 'text-foreground'}`}>
        {hours}h planned
      </p>
      {overloaded && <p className="text-xs text-danger mt-0.5">Exceeds 8h capacity</p>}
    </div>
  );
}

export default function DailyWorkloadChart() {
  return (
    <div className="card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Daily Workload</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Hours planned · 8h daily capacity</p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <div className="w-2.5 h-2.5 rounded-sm bg-primary/70" />Normal
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <div className="w-2.5 h-2.5 rounded-sm bg-danger/70" />Overload
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={workloadData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barSize={22}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 11]}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}h`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="hours" radius={[5, 5, 0, 0]}>
              {workloadData.map((entry, index) => (
                <Cell
                  key={`cell-workload-${index}`}
                  fill={entry.hours > entry.capacity ? 'var(--danger)' : entry.hours > 7.5 ? 'var(--warning)' : 'var(--primary)'}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}