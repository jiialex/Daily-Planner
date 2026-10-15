'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';

interface PlannerSuggestion {
  taskId: string;
  title: string;
  startAt: string;
  endAt: string;
  minutes: number;
  priority: string;
}

interface PlannerResult {
  suggestions: PlannerSuggestion[];
  notScheduled: Array<{ taskId: string; title: string; reason: string }>;
}

function getLocalDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function AIRescheduleBanner({ autoGenerate = false }: { autoGenerate?: boolean }) {
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState<'generate' | 'save' | null>(null);
  const [plan, setPlan] = useState<PlannerResult | null>(null);

  const generatePlan = useCallback(async () => {
    setLoading('generate');
    try {
      const response = await fetch('/api/planner/day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: getLocalDate(),
          dayStartHour: 9,
          dayEndHour: 17,
          breakMinutes: 10,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to generate a plan.');
      setPlan(result as PlannerResult);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to generate a plan.');
    } finally {
      setLoading(null);
    }
  }, []);

  useEffect(() => {
    if (autoGenerate) void generatePlan();
  }, [autoGenerate, generatePlan]);

  useEffect(() => {
    const handleGeneratePlan = () => {
      setVisible(true);
      void generatePlan();
    };
    window.addEventListener('planwise:generate-plan', handleGeneratePlan);
    return () => window.removeEventListener('planwise:generate-plan', handleGeneratePlan);
  }, [generatePlan]);

  const savePlan = async () => {
    if (!plan?.suggestions.length) return;
    setLoading('save');
    try {
      const response = await fetch('/api/planner/day/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blocks: plan.suggestions.map(({ taskId, startAt, endAt }) => ({ taskId, startAt, endAt })),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to save the plan.');
      window.dispatchEvent(new Event('planwise:schedule-updated'));
      setVisible(false);
      toast.success('Plan saved to your schedule.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save the plan.');
    } finally {
      setLoading(null);
    }
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
            <span className="text-sm font-semibold text-foreground">Plan your day</span>
            {plan && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-info/15 text-info">
                {plan.suggestions.length} suggestions
              </span>
            )}
          </div>
          {!plan ? (
            <p className="text-sm text-muted-foreground leading-relaxed">
              Generate a plan from your outstanding tasks, working hours, and existing schedule.
            </p>
          ) : (
            <>
              <div className="space-y-1.5 mt-3">
                {plan.suggestions.map((suggestion) => (
                  <div key={suggestion.taskId} className="flex items-center gap-2 text-sm">
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {formatTime(suggestion.startAt)}–{formatTime(suggestion.endAt)}
                    </span>
                    <span className="truncate text-foreground">{suggestion.title}</span>
                    <span className="text-xs text-muted-foreground">{suggestion.minutes}m</span>
                  </div>
                ))}
              </div>
              {plan.notScheduled.length > 0 && (
                <p className="text-xs text-warning mt-2">
                  {plan.notScheduled.length} task{plan.notScheduled.length === 1 ? '' : 's'} could not fit in these working hours.
                </p>
              )}
              {plan.suggestions.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">No tasks could be scheduled in these working hours.</p>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
          {!plan ? (
            <button
              onClick={() => void generatePlan()}
              disabled={loading !== null}
              className="flex items-center gap-1.5 bg-info text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-[#404040] active:scale-95 transition-all duration-150 disabled:opacity-70"
            >
              {loading === 'generate' ? (
                <Icon name="ArrowPathIcon" size={14} className="animate-spin" />
              ) : (
                <Icon name="SparklesIcon" size={14} />
              )}
              {loading === 'generate' ? 'Planning…' : 'Generate plan'}
            </button>
          ) : (
            <>
              <button
                onClick={() => void savePlan()}
                disabled={loading !== null || plan.suggestions.length === 0}
                className="flex items-center gap-1.5 bg-info text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-[#404040] active:scale-95 transition-all duration-150 disabled:opacity-70"
              >
                {loading === 'save' ? (
                  <Icon name="ArrowPathIcon" size={14} className="animate-spin" />
                ) : (
                  <Icon name="CheckIcon" size={14} />
                )}
                {loading === 'save' ? 'Saving…' : 'Save plan'}
              </button>
              <button onClick={() => setPlan(null)} disabled={loading !== null} className="btn-ghost text-sm px-3 py-2">
                Discard
              </button>
            </>
          )}
          <button
            onClick={() => setVisible(false)}
            disabled={loading !== null}
            className="btn-ghost p-1.5"
            aria-label="Close planning panel"
          >
            <Icon name="XMarkIcon" size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
