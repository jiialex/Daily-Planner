'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

interface NavItem {
  key: string;
  label: string;
  icon: string;
  href: string;
  badge?: number;
  section?: string;
}

const navItems: NavItem[] = [
  { key: 'nav-dashboard', label: 'Schedule Dashboard', icon: 'CalendarDaysIcon', href: '/', section: 'Planning' },
  { key: 'nav-tasks', label: 'Tasks & Goals', icon: 'ClipboardDocumentListIcon', href: '/task-goal-management', badge: 3, section: 'Planning' },
  { key: 'nav-ai-planner', label: 'AI Planner', icon: 'SparklesIcon', href: '/schedule-dashboard', section: 'Planning' },
  { key: 'nav-reports', label: 'Productivity Reports', icon: 'ChartBarIcon', href: '/schedule-dashboard', section: 'Insights' },
  { key: 'nav-reminders', label: 'Reminders', icon: 'BellAlertIcon', href: '/schedule-dashboard', badge: 2, section: 'Insights' },
  { key: 'nav-history', label: 'Reschedule History', icon: 'ArrowPathIcon', href: '/schedule-dashboard', section: 'Insights' },
  { key: 'nav-settings', label: 'Preferences', icon: 'Cog6ToothIcon', href: '/schedule-dashboard', section: 'Account' },
  { key: 'nav-profile', label: 'My Profile', icon: 'UserCircleIcon', href: '/schedule-dashboard', section: 'Account' },
];

const sections = ['Planning', 'Insights', 'Account'];

interface SidebarProps {
  currentPath?: string;
}

export default function Sidebar({ currentPath = '/' }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden lg:flex flex-col bg-card border-r border-border sidebar-transition overflow-hidden flex-shrink-0 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 border-b border-border flex-shrink-0 px-3 ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
        <AppLogo size={32} />
        {!collapsed && (
          <span className="font-extrabold text-base text-foreground tracking-tight truncate">
            Daily Planner
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-2">
        {sections.map((section) => {
          const items = navItems.filter((n) => n.section === section);
          return (
            <div key={`section-${section}`} className="mb-5">
              {!collapsed && (
                <p className="section-header px-3 mb-2">{section}</p>
              )}
              {items.map((item) => {
                const isActive = currentPath === item.href;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`nav-item mb-0.5 relative ${isActive ? 'nav-item-active' : ''} ${collapsed ? 'justify-center px-0 py-2.5' : ''}`}
                  >
                    <Icon
                      name={item.icon as Parameters<typeof Icon>[0]['name']}
                      size={18}
                      className={isActive ? 'text-primary' : 'text-muted-foreground'}
                    />
                    {!collapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                    {!collapsed && item.badge ? (
                      <span className="ml-auto bg-primary text-primary-foreground text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center tabular-nums">
                        {item.badge}
                      </span>
                    ) : null}
                    {collapsed && item.badge ? (
                      <span className="absolute top-1 right-1 bg-danger text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Collapse toggle + user */}
      <div className="border-t border-border p-2 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              DP
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">Jii Alex</p>
              <p className="text-xs text-muted-foreground truncate">Student · Free Plan</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`nav-item w-full ${collapsed ? 'justify-center px-0' : ''}`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon
            name={collapsed ? 'ChevronRightIcon' : 'ChevronLeftIcon'}
            size={16}
            className="text-muted-foreground"
          />
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}