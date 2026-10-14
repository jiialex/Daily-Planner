'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import AppLogo from '@/components/ui/AppLogo';

export default function Topbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="h-16 bg-card border-b border-border flex items-center px-4 lg:px-6 gap-3 flex-shrink-0 z-20">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2">
          <AppLogo size={28} />
          <span className="font-extrabold text-sm text-foreground">Daily Planner</span>
        </div>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tasks, goals, schedules…"
              className="input-field pl-9 py-2 text-sm h-9"
              aria-label="Search"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          {/* Mobile search */}
          <button
            className="md:hidden btn-ghost p-2"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Search"
          >
            <Icon name="MagnifyingGlassIcon" size={18} />
          </button>

          {/* AI Generate Plan */}
          <button className="hidden sm:flex items-center gap-1.5 bg-primary/10 text-primary rounded-xl px-3 py-1.5 text-xs font-semibold hover:bg-primary/20 transition-all duration-150">
            <Icon name="SparklesIcon" size={14} className="text-primary" />
            Generate Plan
          </button>

          {/* Notifications */}
          <button className="btn-ghost p-2 relative" aria-label="Notifications">
            <Icon name="BellIcon" size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full"></span>
          </button>

          {/* Calendar toggle */}
          <button className="btn-ghost p-2" aria-label="Calendar view">
            <Icon name="CalendarDaysIcon" size={18} />
          </button>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold cursor-pointer ml-1">
            DP
          </div>

          {/* Mobile menu */}
          <button
            className="lg:hidden btn-ghost p-2 ml-1"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <Icon name="Bars3Icon" size={18} />
          </button>
        </div>
      </header>

      {/* Mobile search bar */}
      {searchOpen && (
        <div className="md:hidden bg-card border-b border-border px-4 py-2">
          <div className="relative">
            <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tasks, goals…"
              className="input-field pl-9 py-2 text-sm h-9"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <nav className="relative w-72 bg-card h-full shadow-modal flex flex-col p-4 overflow-y-auto">
            <div className="flex items-center gap-2 mb-6">
              <AppLogo size={28} />
              <span className="font-extrabold text-foreground">Daily Planner</span>
              <button className="ml-auto btn-ghost p-1" onClick={() => setMobileOpen(false)}>
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>
            {[
              { key: 'mob-dash', label: 'Schedule Dashboard', href: '/', icon: 'CalendarDaysIcon' },
              { key: 'mob-tasks', label: 'Tasks & Goals', href: '/task-goal-management', icon: 'ClipboardDocumentListIcon' },
              { key: 'mob-ai', label: 'AI Planner', href: '/schedule-dashboard', icon: 'SparklesIcon' },
              { key: 'mob-reports', label: 'Reports', href: '/schedule-dashboard', icon: 'ChartBarIcon' },
              { key: 'mob-settings', label: 'Preferences', href: '/schedule-dashboard', icon: 'Cog6ToothIcon' },
            ].map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="nav-item mb-1"
                onClick={() => setMobileOpen(false)}
              >
                <Icon name={item.icon as Parameters<typeof Icon>[0]['name']} size={18} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}