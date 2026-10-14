'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface KPICard {
  id: string;
  label: string;
  value: string;
  subtext: string;
  trend?: { direction: 'up' | 'down' | 'neutral'; label: string };
  variant: 'hero' | 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  icon: string;
  span?: 'col-2';
}

const kpiCards: KPICard[] = [
  {
    id: 'kpi-completion',
    label: "Today's Completion Rate",
    value: '68%',
    subtext: '11 of 16 tasks done',
    trend: { direction: 'up', label: '+12% vs yesterday' },
    variant: 'hero',
    icon: 'CheckCircleIcon',
    span: 'col-2',
  },
  {
    id: 'kpi-deadline-risk',
    label: 'Deadline Risk',
    value: '3 Goals',
    subtext: 'At risk of late completion',
    trend: { direction: 'down', label: 'Needs attention' },
    variant: 'danger',
    icon: 'ExclamationTriangleIcon',
  },
  {
    id: 'kpi-workload',
    label: "Today's Workload",
    value: '7.5h',
    subtext: '8h available · 30m buffer',
    trend: { direction: 'neutral', label: '94% capacity' },
    variant: 'warning',
    icon: 'ClockIcon',
  },
  {
    id: 'kpi-streak',
    label: 'Completion Streak',
    value: '9 Days',
    subtext: 'Personal best: 14 days',
    trend: { direction: 'up', label: 'Keep it up!' },
    variant: 'success',
    icon: 'FireIcon',
  },
  {
    id: 'kpi-overdue',
    label: 'Overdue Tasks',
    value: '4',
    subtext: '2 high priority, 2 medium',
    trend: { direction: 'down', label: 'Up from 1 yesterday' },
    variant: 'danger',
    icon: 'ExclamationCircleIcon',
  },
  {
    id: 'kpi-reschedule',
    label: 'AI Reschedules This Week',
    value: '6',
    subtext: '3 accepted · 2 pending · 1 dismissed',
    trend: { direction: 'neutral', label: 'Normal range' },
    variant: 'info',
    icon: 'ArrowPathIcon',
  },
];

const variantConfig = {
  hero: {
    card: 'bg-primary text-white',
    label: 'text-white/70',
    value: 'text-white',
    subtext: 'text-white/60',
    trendUp: 'bg-white/20 text-white',
    trendDown: 'bg-white/20 text-white',
    trendNeutral: 'bg-white/15 text-white/80',
    icon: 'text-white/80',
    iconBg: 'bg-white/15',
  },
  success: {
    card: 'bg-card border border-border',
    label: 'text-muted-foreground',
    value: 'text-foreground',
    subtext: 'text-muted-foreground',
    trendUp: 'bg-success-bg text-success',
    trendDown: 'bg-danger-bg text-danger',
    trendNeutral: 'bg-muted text-muted-foreground',
    icon: 'text-success',
    iconBg: 'bg-success-bg',
  },
  danger: {
    card: 'bg-danger-bg border border-danger/20',
    label: 'text-danger/70',
    value: 'text-danger',
    subtext: 'text-danger/60',
    trendUp: 'bg-success-bg text-success',
    trendDown: 'bg-danger/15 text-danger',
    trendNeutral: 'bg-muted text-muted-foreground',
    icon: 'text-danger',
    iconBg: 'bg-danger/15',
  },
  warning: {
    card: 'bg-warning-bg border border-warning/25',
    label: 'text-warning/80',
    value: 'text-foreground',
    subtext: 'text-warning/70',
    trendUp: 'bg-success-bg text-success',
    trendDown: 'bg-danger-bg text-danger',
    trendNeutral: 'bg-warning/15 text-warning',
    icon: 'text-warning',
    iconBg: 'bg-warning/15',
  },
  info: {
    card: 'bg-info-bg border border-info/20',
    label: 'text-info/70',
    value: 'text-info',
    subtext: 'text-info/60',
    trendUp: 'bg-success-bg text-success',
    trendDown: 'bg-danger-bg text-danger',
    trendNeutral: 'bg-info/10 text-info',
    icon: 'text-info',
    iconBg: 'bg-info/15',
  },
  neutral: {
    card: 'bg-card border border-border',
    label: 'text-muted-foreground',
    value: 'text-foreground',
    subtext: 'text-muted-foreground',
    trendUp: 'bg-success-bg text-success',
    trendDown: 'bg-danger-bg text-danger',
    trendNeutral: 'bg-muted text-muted-foreground',
    icon: 'text-muted-foreground',
    iconBg: 'bg-muted',
  },
};

export default function KPIBentoGrid() {
  return (
    // Grid plan: 6 cards → grid-cols-4
    // Row 1: hero spans 2 cols + 2 regular
    // Row 2: 2 regular cards (each span 2 to fill row)
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
      {kpiCards.map((card) => {
        const cfg = variantConfig[card.variant];
        const trendClass =
          card.trend?.direction === 'up'
            ? cfg.trendUp
            : card.trend?.direction === 'down'
            ? cfg.trendDown
            : cfg.trendNeutral;

        const trendIcon =
          card.trend?.direction === 'up' ?'ArrowTrendingUpIcon'
            : card.trend?.direction === 'down' ?'ArrowTrendingDownIcon' :'MinusIcon';

        return (
          <div
            key={card.id}
            className={`rounded-2xl p-5 shadow-card ${cfg.card} ${
              card.span === 'col-2' ?'sm:col-span-2 lg:col-span-2 xl:col-span-2 2xl:col-span-2' :''
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <p className={`text-xs font-semibold uppercase tracking-widest ${cfg.label}`}>
                {card.label}
              </p>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.iconBg}`}>
                <Icon
                  name={card.icon as Parameters<typeof Icon>[0]['name']}
                  size={16}
                  className={cfg.icon}
                />
              </div>
            </div>

            <p className={`text-3xl font-bold tabular-nums mb-1 ${cfg.value}`}>
              {card.value}
            </p>
            <p className={`text-xs ${cfg.subtext} mb-3`}>{card.subtext}</p>

            {card.trend && (
              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${trendClass}`}>
                <Icon
                  name={trendIcon as Parameters<typeof Icon>[0]['name']}
                  size={11}
                />
                {card.trend.label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}