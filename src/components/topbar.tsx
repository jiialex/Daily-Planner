'use client';

import React, { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import AppLogo from '@/components/ui/AppLogo';
import { toast } from 'sonner';

interface TaskReminder {
  id: string;
  title: string;
  deadline: string;
  status: string;
}

interface Reminder {
  id: string;
  title: string;
  deadline: string;
  daysLeft: number;
}

const mobileLinks = [
  { key: 'mob-dash', label: 'Schedule Dashboard', href: '/', icon: 'CalendarDaysIcon' },
  { key: 'mob-tasks', label: 'Tasks & Goals', href: '/task-goal-management', icon: 'ClipboardDocumentListIcon' },
  { key: 'mob-ai', label: 'AI Planner', href: '/?generate=1#planner', icon: 'SparklesIcon' },
  { key: 'mob-reports', label: 'Productivity Reports', href: '/#reports', icon: 'ChartBarIcon' },
  { key: 'mob-reminders', label: 'Upcoming Deadlines', href: '/#deadlines', icon: 'BellAlertIcon' },
  { key: 'mob-history', label: 'Schedule', href: '/#today-schedule', icon: 'ArrowPathIcon' },
];

export default function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [remindersLoading, setRemindersLoading] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [userName, setUserName] = useState('My account');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    setNotificationPermission('Notification' in window ? Notification.permission : 'unsupported');
  }, []);

  useEffect(() => {
    let active = true;
    void fetch('/api/auth/me', { cache: 'no-store' })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to load account details.');
        if (active && result.user) {
          setUserName(result.user.name || 'My account');
          setUserEmail(result.user.email || '');
        }
      })
      .catch((error: unknown) => {
        if (active) toast.error(error instanceof Error ? error.message : 'Unable to load account details.');
      });
    return () => { active = false; };
  }, []);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    if (!query) return;
    router.push(`/task-goal-management?search=${encodeURIComponent(query)}`);
    setSearchOpen(false);
    setMobileOpen(false);
  };

  const toggleNotifications = async () => {
    if (notificationsOpen) {
      setNotificationsOpen(false);
      return;
    }
    setNotificationsOpen(true);
    setRemindersLoading(true);
    try {
      const response = await fetch('/api/tasks', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to load reminders.');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const upcoming = (result.tasks as TaskReminder[])
        .filter((task) => task.deadline && task.status !== 'completed')
        .map((task) => ({
          id: task.id,
          title: task.title,
          deadline: task.deadline,
          daysLeft: Math.ceil((new Date(`${task.deadline}T00:00:00`).getTime() - today.getTime()) / 86_400_000),
        }))
        .filter((task) => task.daysLeft <= 3)
        .sort((a, b) => a.daysLeft - b.daysLeft);
      setReminders(upcoming);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load reminders.');
    } finally {
      setRemindersLoading(false);
    }
  };

  const enableScheduleReminders = async () => {
    if (!('Notification' in window)) {
      setNotificationPermission('unsupported');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        toast.success('Schedule reminders are enabled.');
      } else if (permission === 'denied') {
        toast.error('Notifications are blocked. Allow them in your browser site settings to receive schedule reminders.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to enable schedule reminders.');
    }
  };

  const openPlanner = () => {
    if (pathname !== '/') {
      router.push('/?generate=1#planner');
      return;
    }
    router.push('/#planner');
    window.setTimeout(() => {
      document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.dispatchEvent(new Event('planwise:generate-plan'));
    }, 100);
  };

  const openCalendar = () => {
    router.push('/?range=week#today-schedule');
    window.dispatchEvent(new CustomEvent('planwise:set-range', { detail: 'week' }));
    window.setTimeout(() => {
      document.getElementById('today-schedule')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const signOut = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Unable to sign out.');
      router.replace('/sign-up-login-screen');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to sign out.');
    }
  };

  const searchForm = (mobile = false) => (
    <form onSubmit={submitSearch} className={`relative ${mobile ? 'w-full' : 'w-full'}`}>
      <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={mobile ? 'Search tasks and goals…' : 'Search tasks and goals…'}
        className="input-field pl-9 py-2 text-sm h-9"
        aria-label="Search tasks and goals"
      />
    </form>
  );

  return (
    <>
      <header className="h-16 bg-card border-b border-border flex items-center px-4 lg:px-6 gap-3 flex-shrink-0 z-20 relative">
        <div className="flex lg:hidden items-center gap-2">
          <AppLogo size={28} />
          <span className="font-extrabold text-sm text-foreground">Daily Planner</span>
        </div>

        <div className="hidden md:flex flex-1 max-w-md">{searchForm()}</div>

        <div className="flex items-center gap-1 ml-auto">
          <button
            type="button"
            className="md:hidden btn-ghost p-2"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Search"
            aria-expanded={searchOpen}
          >
            <Icon name="MagnifyingGlassIcon" size={18} />
          </button>

          <button
            type="button"
            onClick={openPlanner}
            className="hidden sm:flex items-center gap-1.5 bg-primary/10 text-primary rounded-xl px-3 py-1.5 text-xs font-semibold hover:bg-primary/20 transition-all duration-150"
          >
            <Icon name="SparklesIcon" size={14} className="text-primary" />
            Generate Plan
          </button>

          <button
            type="button"
            onClick={() => void toggleNotifications()}
            className="btn-ghost p-2 relative"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
          >
            <Icon name="BellIcon" size={18} />
            {reminders.length > 0 && (
              <span className="absolute top-1 right-1 min-w-2 h-2 rounded-full bg-danger" />
            )}
          </button>

          <button type="button" onClick={openCalendar} className="btn-ghost p-2" aria-label="Show weekly calendar">
            <Icon name="CalendarDaysIcon" size={18} />
          </button>

          <div className="hidden sm:block text-right ml-2 max-w-36">
            <p className="text-xs font-semibold text-foreground truncate">{userName}</p>
            {userEmail && <p className="text-[10px] text-muted-foreground truncate">{userEmail}</p>}
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="btn-ghost ml-1 text-xs font-semibold"
            aria-label="Sign out"
          >
            Sign out
          </button>

          <button
            type="button"
            className="lg:hidden btn-ghost p-2 ml-1"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            <Icon name="Bars3Icon" size={18} />
          </button>
        </div>

        {notificationsOpen && (
          <section className="absolute right-4 top-14 z-40 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-card p-3 shadow-modal" aria-label="Notifications">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-foreground">Reminders</h2>
              <button type="button" onClick={() => setNotificationsOpen(false)} className="btn-ghost p-1" aria-label="Close notifications">
                <Icon name="XMarkIcon" size={15} />
              </button>
            </div>
            <div className="mb-3 rounded-lg bg-muted p-2.5">
              <p className="text-xs font-semibold text-foreground">Schedule reminders</p>
              {notificationPermission === 'granted' ? (
                <p className="mt-1 text-xs text-muted-foreground">Enabled. Keep PlanWise open to be reminded when a block starts.</p>
              ) : notificationPermission === 'denied' ? (
                <p className="mt-1 text-xs text-muted-foreground">Browser alerts are blocked. In-app reminders still appear while PlanWise is open; allow notifications in site settings for browser alerts.</p>
              ) : notificationPermission === 'unsupported' ? (
                <p className="mt-1 text-xs text-muted-foreground">Browser alerts are unavailable, but in-app reminders appear while PlanWise is open.</p>
              ) : (
                <>
                  <p className="mt-1 text-xs text-muted-foreground">Get a browser notification when a saved schedule block starts. Keep PlanWise open.</p>
                  <button type="button" onClick={() => void enableScheduleReminders()} className="btn-secondary mt-2 px-2.5 py-1.5 text-xs">
                    Enable schedule reminders
                  </button>
                </>
              )}
            </div>
            {remindersLoading ? (
              <p className="py-4 text-center text-xs text-muted-foreground">Loading reminders…</p>
            ) : reminders.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">No tasks due in the next three days.</p>
            ) : (
              <ul className="space-y-1 max-h-64 overflow-y-auto">
                {reminders.map((reminder) => (
                  <li key={reminder.id}>
                    <Link
                      href={`/task-goal-management?search=${encodeURIComponent(reminder.title)}`}
                      onClick={() => setNotificationsOpen(false)}
                      className="block rounded-lg p-2 hover:bg-muted"
                    >
                      <span className="block text-sm text-foreground truncate">{reminder.title}</span>
                      <span className={`text-xs ${reminder.daysLeft < 0 ? 'text-danger' : 'text-muted-foreground'}`}>
                        {reminder.daysLeft < 0
                          ? `${Math.abs(reminder.daysLeft)} day${Math.abs(reminder.daysLeft) === 1 ? '' : 's'} overdue`
                          : reminder.daysLeft === 0
                            ? 'Due today'
                            : `Due in ${reminder.daysLeft} day${reminder.daysLeft === 1 ? '' : 's'}`}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </header>

      {searchOpen && <div className="md:hidden bg-card border-b border-border px-4 py-2">{searchForm(true)}</div>}

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <button type="button" className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} aria-label="Close menu" />
          <nav className="relative w-72 bg-card h-full shadow-modal flex flex-col p-4 overflow-y-auto">
            <div className="flex items-center gap-2 mb-6">
              <AppLogo size={28} />
              <span className="font-extrabold text-foreground">Daily Planner</span>
              <button type="button" className="ml-auto btn-ghost p-1" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>
            {mobileLinks.map((item) => {
              const href = item.href.split('#')[0] || '/';
              const isActive = pathname === href;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`nav-item mb-1 ${isActive ? 'nav-item-active' : ''}`}
                  onClick={(event) => {
                    setMobileOpen(false);
                    if (item.key === 'mob-ai') {
                      event.preventDefault();
                      openPlanner();
                    }
                  }}
                >
                  <Icon name={item.icon as Parameters<typeof Icon>[0]['name']} size={18} />
                  {item.label}
                </Link>
              );
            })}
            <button type="button" onClick={() => void signOut()} className="nav-item mt-auto">
              <Icon name="ArrowRightStartOnRectangleIcon" size={18} />
              Sign out
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
