'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';

export default function AIRescheduleBanner() {
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState<'accept' | 'reject' | null>(null);

  const handleAccept = () => {
    setLoading('accept');
    // Backend integration: POST /api/reschedule/proposals/{id}/accept
    setTimeout(() => {
      setLoading(null);
      setVisible(false);
      toast?.success('Rescheduling proposal accepted — your schedule has been updated.');
    }, 1200);
  };

  const handleReject = () => {
    setLoading('reject');
    // Backend integration: POST /api/reschedule/proposals/{id}/reject
    setTimeout(() => {
      setLoading(null);
      setVisible(false);
      toast?.info('Proposal dismissed. Your original schedule is unchanged.');
    }, 800);
  };

  if (!visible) return null;

  return (
    <div className="mb-5 border border-info/30 bg-info-bg rounded-2xl p-4 slide-up">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-info/15 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon name="SparklesIcon" size={18} className="text-info" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-foreground">AI Rescheduling Proposal Ready</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-info/15 text-info">
              2 tasks affected
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You missed <strong className="text-foreground">Data Structures Study Session</strong> (2h) yesterday.
            I&apos;ve found 2 open slots today — 14:00–16:00 and an early session tomorrow at 07:00 — to keep your
            <strong className="text-foreground"> Database Exam</strong> on track (due in 4 days).
          </p>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon name="ArrowRightIcon" size={13} className="text-warning" />
              <span>Data Structures Study: <span className="text-foreground font-medium">Mon 08:00 → Today 14:00</span></span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon name="ArrowRightIcon" size={13} className="text-warning" />
              <span>Practice Quiz: <span className="text-foreground font-medium">Wed 10:00 → Thu 07:00</span></span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
          <button
            onClick={handleAccept}
            disabled={loading !== null}
            className="flex items-center gap-1.5 bg-info text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-[#404040] active:scale-95 transition-all duration-150 disabled:opacity-70"
          >
            {loading === 'accept' ? (
              <Icon name="ArrowPathIcon" size={14} className="animate-spin" />
            ) : (
              <Icon name="CheckIcon" size={14} />
            )}
            {loading === 'accept' ? 'Applying…' : 'Accept'}
          </button>
          <button
            onClick={handleReject}
            disabled={loading !== null}
            className="btn-ghost text-sm px-3 py-2 disabled:opacity-70"
          >
            Dismiss
          </button>
          <button
            onClick={() => setVisible(false)}
            className="btn-ghost p-1.5"
            aria-label="Close banner"
          >
            <Icon name="XMarkIcon" size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}