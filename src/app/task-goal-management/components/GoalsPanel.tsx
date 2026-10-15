'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import type { Goal } from '@/lib/planner-types';

type GoalFormData = Pick<Goal, 'title' | 'category'> & { deadline: string };
type GoalRisk = 'on-track' | 'at-risk' | 'critical';

const riskBadge: Record<GoalRisk, { variant: 'danger' | 'warning' | 'success'; label: string; color: string }> = {
  critical: { variant: 'danger', label: 'Critical', color: 'bg-danger' },
  'at-risk': { variant: 'warning', label: 'At Risk', color: 'bg-warning' },
  'on-track': { variant: 'success', label: 'On Track', color: 'bg-success' },
};

async function requestApi<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'The request could not be completed.');
  return data as T;
}

function getDaysLeft(deadline: string | null): number {
  if (!deadline) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(`${deadline}T00:00:00`).getTime() - today.getTime()) / 86_400_000);
}

function getGoalRisk(goal: Goal, daysLeft: number): GoalRisk {
  const completion = goal.totalTasks === 0 ? 0 : goal.completedTasks / goal.totalTasks;
  if (daysLeft <= 4 && completion < 0.75) return 'critical';
  if (daysLeft <= 10 && completion < 0.6) return 'at-risk';
  return 'on-track';
}

export default function GoalsPanel() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<GoalFormData>({
    defaultValues: { title: '', category: 'Personal', deadline: '' },
  });

  const loadGoals = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { goals: loadedGoals } = await requestApi<{ goals: Goal[] }>('/api/goals');
      setGoals(loadedGoals);
      setSelectedGoalId((selected) => selected ?? loadedGoals[0]?.id ?? null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load goals.';
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGoals();
  }, [loadGoals]);

  const openGoalForm = (goal?: Goal) => {
    const selected = goal ?? null;
    setEditingGoal(selected);
    reset(selected
      ? { title: selected.title, category: selected.category, deadline: selected.deadline ?? '' }
      : { title: '', category: 'Personal', deadline: '' });
    setModalOpen(true);
  };

  const saveGoal = async (data: GoalFormData) => {
    try {
      const body = { ...data, deadline: data.deadline || null };
      if (editingGoal) {
        const { goal } = await requestApi<{ goal: Goal }>(`/api/goals/${editingGoal.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        setGoals((previous) => previous.map((item) => item.id === goal.id ? goal : item));
        toast.success('Goal updated.');
      } else {
        const { goal } = await requestApi<{ goal: Goal }>('/api/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        setGoals((previous) => [...previous, goal]);
        setSelectedGoalId(goal.id);
        toast.success('Goal created.');
      }
      setModalOpen(false);
      setEditingGoal(null);
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save goal.');
    }
  };

  const removeGoal = async (goal: Goal) => {
    try {
      await requestApi(`/api/goals/${goal.id}`, { method: 'DELETE' });
      setGoals((previous) => previous.filter((item) => item.id !== goal.id));
      if (selectedGoalId === goal.id) setSelectedGoalId(null);
      toast.success('Goal deleted.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete goal.');
    }
  };

  const totalTasks = goals.reduce((sum, goal) => sum + goal.totalTasks, 0);
  const completedTasks = goals.reduce((sum, goal) => sum + goal.completedTasks, 0);

  return (
    <>
      <div className="card p-4 sticky top-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">Active Goals</h2>
          <span className="text-xs text-muted-foreground tabular-nums">{goals.length} goals</span>
        </div>

        {loading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Loading goals…</p>
        ) : loadError ? (
          <div className="py-4 text-center">
            <p className="text-sm text-danger">{loadError}</p>
            <button onClick={() => void loadGoals()} className="btn-secondary mt-3 text-sm">Try again</button>
          </div>
        ) : goals.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Create a goal to get started.</p>
        ) : (
          <div className="space-y-2">
            {goals.map((goal) => {
              const pct = goal.totalTasks === 0 ? 0 : Math.round((goal.completedTasks / goal.totalTasks) * 100);
              const daysLeft = getDaysLeft(goal.deadline);
              const risk = riskBadge[getGoalRisk(goal, daysLeft)];
              const isSelected = selectedGoalId === goal.id;

              return (
                <div
                  key={goal.id}
                  onClick={() => setSelectedGoalId(goal.id)}
                  className={`rounded-xl p-3 cursor-pointer transition-all duration-150 border ${
                    isSelected ? 'border-primary/30 bg-secondary' : 'border-transparent hover:border-border hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${risk.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground leading-tight truncate">{goal.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-muted-foreground">{goal.category}</span>
                        {daysLeft < 999 && (
                          <>
                            <span className="text-border text-xs">·</span>
                            <span className={`text-xs font-medium tabular-nums ${
                              daysLeft <= 4 ? 'text-danger' : daysLeft <= 10 ? 'text-warning' : 'text-muted-foreground'
                            }`}>{daysLeft}d left</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant={risk.variant}>{risk.label}</Badge>
                      <button
                        onClick={(event) => { event.stopPropagation(); openGoalForm(goal); }}
                        className="rounded p-1 text-muted-foreground hover:bg-muted"
                        aria-label={`Edit ${goal.title}`}
                      >
                        <Icon name="PencilSquareIcon" size={13} />
                      </button>
                      <button
                        onClick={(event) => { event.stopPropagation(); void removeGoal(goal); }}
                        className="rounded p-1 text-muted-foreground hover:bg-danger-bg hover:text-danger"
                        aria-label={`Delete ${goal.title}`}
                      >
                        <Icon name="TrashIcon" size={13} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{goal.completedTasks}/{goal.totalTasks} tasks</span>
                      <span className="text-xs font-semibold tabular-nums text-foreground">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${risk.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'summary-total', label: 'Total tasks', value: totalTasks },
              { key: 'summary-done', label: 'Completed', value: completedTasks },
            ].map((summary) => (
              <div key={summary.key} className="bg-muted rounded-xl p-2.5 text-center">
                <p className="text-base font-bold text-foreground tabular-nums">{summary.value}</p>
                <p className="text-xs text-muted-foreground">{summary.label}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => openGoalForm()}
          className="btn-secondary w-full mt-3 text-sm h-9 flex items-center justify-center gap-1.5"
        >
          <Icon name="PlusIcon" size={15} />
          Add Goal
        </button>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingGoal(null); reset(); }}
        title={editingGoal ? 'Edit Goal' : 'Create Goal'}
        size="md"
        footer={
          <>
            <button type="button" onClick={() => { setModalOpen(false); setEditingGoal(null); reset(); }} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" form="goal-form" className="btn-primary">
              {editingGoal ? 'Save Changes' : 'Create Goal'}
            </button>
          </>
        }
      >
        <form id="goal-form" onSubmit={handleSubmit(saveGoal)} className="space-y-4" noValidate>
          <div>
            <label className="label" htmlFor="goal-title">Goal name</label>
            <input
              id="goal-title"
              className="input-field"
              maxLength={120}
              {...register('title', { required: 'Goal name is required' })}
            />
            {errors.title && <p className="error-text">{errors.title.message}</p>}
          </div>
          <div>
            <label className="label" htmlFor="goal-category">Category</label>
            <select id="goal-category" className="input-field" {...register('category', { required: 'Choose a category' })}>
              <option>Academic</option>
              <option>Work</option>
              <option>Personal</option>
              <option>Health</option>
              <option>Other</option>
            </select>
            {errors.category && <p className="error-text">{errors.category.message}</p>}
          </div>
          <div>
            <label className="label" htmlFor="goal-deadline">Deadline (optional)</label>
            <input id="goal-deadline" type="date" className="input-field" {...register('deadline')} />
          </div>
        </form>
      </Modal>
    </>
  );
}
