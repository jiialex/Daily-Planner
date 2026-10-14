import React from 'react';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

const features = [
  { key: 'feat-ai', icon: 'SparklesIcon', title: 'AI-Generated Schedules', desc: 'Tell us your goals — we build a realistic daily plan in seconds.' },
  { key: 'feat-reschedule', icon: 'ArrowPathIcon', title: 'Smart Rescheduling', desc: 'Missed a task? The AI finds the next best slot automatically.' },
  { key: 'feat-risk', icon: 'ShieldCheckIcon', title: 'Deadline Risk Alerts', desc: 'Know before it\'s too late which goals need more attention.' },
  { key: 'feat-track', icon: 'ChartBarIcon', title: 'Progress Tracking', desc: 'Visual reports show what you completed vs. what slipped.' },
];

const testimonial = {
  quote: 'PlanWise helped me prepare for 4 exams without pulling all-nighters. When I missed a session, it just fixed my plan.',
  name: 'Tigist Haile',
  role: 'Computer Science student, AAU',
};

export default function BrandPanel() {
  return (
    <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col relative overflow-hidden bg-primary p-10 xl:p-14">
      {/* Background blobs */}
      <div className="absolute top-[-80px] left-[-60px] w-72 h-72 blob-primary" />
      <div className="absolute bottom-[-60px] right-[-40px] w-80 h-80 blob-accent" />

      {/* Logo */}
      <div className="relative flex items-center gap-3 mb-12">
        <AppLogo size={36} />
        <span className="font-extrabold text-xl text-white tracking-tight">PlanWise AI</span>
      </div>

      {/* Hero copy */}
      <div className="relative flex-1">
        <h1 className="text-hero-xl font-extrabold text-white leading-tight mb-4">
          Plan smarter.<br />
          Adapt faster.<br />
          <span className="text-white/60">Achieve more.</span>
        </h1>
        <p className="text-white/70 text-base leading-relaxed max-w-sm mb-10">
          PlanWise AI turns your goals into daily schedules and automatically recovers your plan when life gets in the way — no manual replanning needed.
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-10">
          {features.map((f) => (
            <div key={f.key} className="flex gap-3 items-start">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <Icon name={f.icon as Parameters<typeof Icon>[0]['name']} size={17} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{f.title}</p>
                <p className="text-xs text-white/60 leading-relaxed mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div className="bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-sm">
          <p className="text-sm text-white/85 italic leading-relaxed mb-3">&quot;{testimonial.quote}&quot;</p>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
              TH
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{testimonial.name}</p>
              <p className="text-xs text-white/60">{testimonial.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="relative flex items-center gap-6 pt-6 border-t border-white/20 mt-6">
        {[
          { key: 'stat-users', value: '12,400+', label: 'Active planners' },
          { key: 'stat-tasks', value: '89%', label: 'Avg completion rate' },
          { key: 'stat-reschedule', value: '3.2×', label: 'Fewer missed deadlines' },
        ].map((s) => (
          <div key={s.key}>
            <p className="text-xl font-bold text-white tabular-nums">{s.value}</p>
            <p className="text-xs text-white/60">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}