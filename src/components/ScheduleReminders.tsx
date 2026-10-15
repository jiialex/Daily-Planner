'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

interface ScheduledBlock {
  id: string;
  title: string;
  startAt: string;
  task: { status: string } | null;
}

const storageKey = 'planwise:sent-schedule-reminders';

function getReminderKey(block: ScheduledBlock) {
  return `${block.id}:${block.startAt}`;
}

export default function ScheduleReminders() {
  useEffect(() => {
    let active = true;
    let loadErrorShown = false;
    let blocks: ScheduledBlock[] = [];
    const sentInThisSession = new Set<string>();

    const loadSchedule = async () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      const query = new URLSearchParams({ start: start.toISOString(), end: end.toISOString() });

      try {
        const response = await fetch(`/api/schedule?${query}`, { cache: 'no-store' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to load schedule reminders.');
        if (active) {
          blocks = result.blocks as ScheduledBlock[];
          loadErrorShown = false;
        }
      } catch (error) {
        if (active && !loadErrorShown) {
          loadErrorShown = true;
          console.error('Unable to load schedule reminders:', error);
          toast.error(error instanceof Error ? error.message : 'Unable to load schedule reminders.');
        }
      }
    };

    const checkSchedule = () => {
      const now = Date.now();
      for (const block of blocks) {
        if (block.task?.status === 'COMPLETED' || block.task?.status === 'MISSED') continue;
        const startAt = Date.parse(block.startAt);
        if (!Number.isFinite(startAt) || startAt > now || startAt < now - 120_000) continue;

        const key = getReminderKey(block);
        if (sentInThisSession.has(key)) continue;

        let alreadySent = false;
        try {
          const sent = JSON.parse(localStorage.getItem(storageKey) ?? '[]') as string[];
          alreadySent = sent.includes(key);
          if (!alreadySent) {
            localStorage.setItem(storageKey, JSON.stringify([...sent.slice(-199), key]));
          }
        } catch (error) {
          console.error('Unable to persist schedule reminder state:', error);
        }
        if (alreadySent) {
          sentInThisSession.add(key);
          continue;
        }

        sentInThisSession.add(key);
        toast.info(`It's time for ${block.title}.`, { duration: 10_000 });
        if ('Notification' in window && Notification.permission === 'granted') {
          const notification = new Notification('Schedule starting now', {
            body: block.title,
            tag: `schedule-${block.id}`,
          });
          notification.onclick = () => {
            window.focus();
            window.location.assign('/#today-schedule');
            notification.close();
          };
        }
      }
    };

    void loadSchedule();
    const fetchTimer = window.setInterval(() => void loadSchedule(), 60_000);
    const checkTimer = window.setInterval(checkSchedule, 15_000);
    const refreshOnScheduleChange = () => void loadSchedule();
    const refreshOnVisible = () => {
      if (document.visibilityState === 'visible') void loadSchedule();
    };
    window.addEventListener('planwise:schedule-updated', refreshOnScheduleChange);
    document.addEventListener('visibilitychange', refreshOnVisible);

    return () => {
      active = false;
      window.clearInterval(fetchTimer);
      window.clearInterval(checkTimer);
      window.removeEventListener('planwise:schedule-updated', refreshOnScheduleChange);
      document.removeEventListener('visibilitychange', refreshOnVisible);
    };
  }, []);

  return null;
}
