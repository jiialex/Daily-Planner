import React from 'react';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

const features = [
  { key: 'feat-ai', icon: 'SparklesIcon', title: 'Build your daily plan', desc: 'Add tasks, set priorities, and choose when you want to work on them.' },
  { key: 'feat-reschedule', icon: 'ArrowPathIcon', title: 'Adjust it anytime', desc: 'Move tasks around whenever your plans change.' },
  { key: 'feat-risk', icon: 'ShieldCheckIcon', title: 'Keep deadlines in view', desc: 'See what is coming up and decide what needs your attention.' },
  { key: 'feat-track', icon: 'ChartBarIcon', title: 'Track your progress', desc: 'Keep track of the tasks you have completed.' },
];

const testimonial = {
  quote: 'Plan your day, adjust it when life changes, and keep moving toward what matters.',
  name: 'Daily planning',
  role: 'A flexible plan for everyday life',
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
        <span className="font-extrabold text-xl text-white tracking-tight">Daily Planner</span>
      </div>

      {/* Hero copy */}
      <div className="relative flex-1">
        <h1 className="text-hero-xl font-extrabold text-white leading-tight mb-4">
          Make a plan.<br />
          Make it yours.<br />
          <span className="text-white/60">Get things done.</span>
        </h1>
        <p className="text-white/70 text-base leading-relaxed max-w-sm mb-10">
          Daily Planner helps you organize tasks, set priorities, and shape a schedule that works for you. Plan manually, make changes anytime, and track what you get done.
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
              DP
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
          { key: 'stat-users', value: 'Your plan', label: 'Built around your priorities' },
          { key: 'stat-tasks', value: 'Your pace', label: 'Adjust it whenever you need' },
          { key: 'stat-reschedule', value: 'Your progress', label: 'See what you have completed' },
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