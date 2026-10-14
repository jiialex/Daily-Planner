'use client';

import React, { useState, useMemo } from 'react';
import Icon from '@/components/ui/AppIcon';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type TaskStatus = 'pending' | 'scheduled' | 'in-progress' | 'completed' | 'missed' | 'rescheduled' | 'upcoming';
type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

interface Task {
  id: string;
  title: string;
  goal: string;
  goalId: string;
  priority: TaskPriority;
  status: TaskStatus;
  estimatedDuration: string;
  scheduledDate: string;
  scheduledTime: string;
  deadline: string;
  dependency: string | null;
  aiSuggested: boolean;
}

const tasks: Task[] = [
  { id: 'task-001', title: 'Linked Lists — Theory & Notes', goal: 'Database Exam Prep', goalId: 'goal-001', priority: 'critical', status: 'completed', estimatedDuration: '2h', scheduledDate: '13 Oct', scheduledTime: '08:00', deadline: '17 Oct', dependency: null, aiSuggested: true },
  { id: 'task-002', title: 'Algorithm Design Lecture Review', goal: 'Database Exam Prep', goalId: 'goal-001', priority: 'high', status: 'completed', estimatedDuration: '1h 45m', scheduledDate: '13 Oct', scheduledTime: '10:15', deadline: '17 Oct', dependency: 'task-001', aiSuggested: true },
  { id: 'task-003', title: 'Data Structures Study Session ✦', goal: 'Database Exam Prep', goalId: 'goal-001', priority: 'critical', status: 'rescheduled', estimatedDuration: '2h', scheduledDate: '13 Oct', scheduledTime: '14:45', deadline: '17 Oct', dependency: 'task-002', aiSuggested: true },
  { id: 'task-004', title: 'Practice Quiz Set A', goal: 'Database Exam Prep', goalId: 'goal-001', priority: 'high', status: 'rescheduled', estimatedDuration: '1h', scheduledDate: '14 Oct', scheduledTime: '07:00', deadline: '17 Oct', dependency: 'task-003', aiSuggested: true },
  { id: 'task-005', title: 'SE Project Architecture Diagram', goal: 'SE Project Phase 2', goalId: 'goal-002', priority: 'high', status: 'in-progress', estimatedDuration: '1h 30m', scheduledDate: '13 Oct', scheduledTime: '13:00', deadline: '20 Oct', dependency: null, aiSuggested: false },
  { id: 'task-006', title: 'Team Project Meeting Prep', goal: 'SE Project Phase 2', goalId: 'goal-002', priority: 'medium', status: 'upcoming', estimatedDuration: '30m', scheduledDate: '13 Oct', scheduledTime: '16:30', deadline: '20 Oct', dependency: 'task-005', aiSuggested: false },
  { id: 'task-007', title: 'OS Chapter 4 — Process Management', goal: 'Operating Systems Exam', goalId: 'goal-003', priority: 'high', status: 'scheduled', estimatedDuration: '1h 30m', scheduledDate: '13 Oct', scheduledTime: '19:00', deadline: '24 Oct', dependency: null, aiSuggested: true },
  { id: 'task-008', title: 'OS Chapter 5 — Memory Management', goal: 'Operating Systems Exam', goalId: 'goal-003', priority: 'high', status: 'pending', estimatedDuration: '2h', scheduledDate: '14 Oct', scheduledTime: '09:00', deadline: '24 Oct', dependency: 'task-007', aiSuggested: true },
  { id: 'task-009', title: 'Sorting Algorithms — Big-O Analysis', goal: 'Algorithms Course', goalId: 'goal-004', priority: 'medium', status: 'completed', estimatedDuration: '1h', scheduledDate: '12 Oct', scheduledTime: '14:00', deadline: '28 Oct', dependency: null, aiSuggested: false },
  { id: 'task-010', title: 'Graph Traversal Problem Set', goal: 'Algorithms Course', goalId: 'goal-004', priority: 'medium', status: 'scheduled', estimatedDuration: '1h 30m', scheduledDate: '15 Oct', scheduledTime: '10:00', deadline: '28 Oct', dependency: 'task-009', aiSuggested: false },
  { id: 'task-011', title: 'Research Paper Outline', goal: 'Research Paper Draft', goalId: 'goal-005', priority: 'medium', status: 'missed', estimatedDuration: '45m', scheduledDate: '11 Oct', scheduledTime: '20:00', deadline: '05 Nov', dependency: null, aiSuggested: false },
  { id: 'task-012', title: 'Literature Review Section', goal: 'Research Paper Draft', goalId: 'goal-005', priority: 'low', status: 'pending', estimatedDuration: '2h', scheduledDate: '16 Oct', scheduledTime: '18:00', deadline: '05 Nov', dependency: 'task-011', aiSuggested: false },
];

const statusConfig: Record<TaskStatus, { variant: 'success' | 'info' | 'warning' | 'danger' | 'neutral' | 'primary'; label: string }> = {
  completed: { variant: 'success', label: 'Completed' },
  'in-progress': { variant: 'info', label: 'In Progress' },
  scheduled: { variant: 'primary', label: 'Scheduled' },
  pending: { variant: 'neutral', label: 'Pending' },
  missed: { variant: 'danger', label: 'Missed' },
  rescheduled: { variant: 'warning', label: 'Rescheduled ✦' },
  upcoming: { variant: 'neutral', label: 'Upcoming' },
};

const priorityConfig: Record<TaskPriority, { color: string; label: string }> = {
  critical: { color: 'text-danger font-bold', label: '⚑ Critical' },
  high: { color: 'text-warning font-semibold', label: '↑ High' },
  medium: { color: 'text-info font-medium', label: '→ Medium' },
  low: { color: 'text-muted-foreground', label: '↓ Low' },
};

interface CreateTaskFormData {
  title: string;
  goal: string;
  priority: TaskPriority;
  estimatedDuration: string;
  deadline: string;
  scheduledDate: string;
  scheduledTime: string;
  dependency: string;
  notes: string;
}

export default function TaskTableSection() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterGoal, setFilterGoal] = useState<string>('all');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<keyof Task>('scheduledDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [taskList, setTaskList] = useState<Task[]>(tasks);
  const [statusDropdownId, setStatusDropdownId] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateTaskFormData>({
    defaultValues: { title: '', goal: '', priority: 'medium', estimatedDuration: '', deadline: '', scheduledDate: '', scheduledTime: '', dependency: '', notes: '' },
  });

  const uniqueGoals = Array.from(new Set(tasks.map((t) => t.goal)));

  const filtered = useMemo(() => {
    let result = taskList;
    if (search) result = result.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()) || t.goal.toLowerCase().includes(search.toLowerCase()));
    if (filterStatus !== 'all') result = result.filter((t) => t.status === filterStatus);
    if (filterPriority !== 'all') result = result.filter((t) => t.priority === filterPriority);
    if (filterGoal !== 'all') result = result.filter((t) => t.goal === filterGoal);
    result = [...result].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return result;
  }, [taskList, search, filterStatus, filterPriority, filterGoal, sortKey, sortDir]);

  const toggleSort = (key: keyof Task) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === filtered.length) setSelectedRows(new Set());
    else setSelectedRows(new Set(filtered.map((t) => t.id)));
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setTimeout(() => {
      setTaskList((prev) => prev.filter((t) => t.id !== id));
      setDeletingId(null);
      toast.success('Task deleted successfully.');
    }, 350);
  };

  const handleBulkDelete = () => {
    const ids = Array.from(selectedRows);
    setTaskList((prev) => prev.filter((t) => !ids.includes(t.id)));
    setSelectedRows(new Set());
    toast.success(`${ids.length} tasks deleted.`);
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTaskList((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    setStatusDropdownId(null);
    toast.success('Task status updated.');
  };

  const onCreateTask = (data: CreateTaskFormData) => {
    // Backend integration: POST /api/tasks with task data
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: data.title,
      goal: data.goal || 'Uncategorized',
      goalId: 'goal-misc',
      priority: data.priority,
      status: 'pending',
      estimatedDuration: data.estimatedDuration,
      scheduledDate: data.scheduledDate,
      scheduledTime: data.scheduledTime,
      deadline: data.deadline,
      dependency: data.dependency || null,
      aiSuggested: false,
    };
    setTaskList((prev) => [newTask, ...prev]);
    reset();
    setModalOpen(false);
    toast.success('Task created — it will appear in your next scheduled plan.');
  };

  const SortIcon = ({ col }: { col: keyof Task }) => (
    <span className="ml-1 inline-flex flex-col">
      <Icon
        name="ChevronUpIcon"
        size={10}
        className={sortKey === col && sortDir === 'asc' ? 'text-primary' : 'text-border'}
      />
      <Icon
        name="ChevronDownIcon"
        size={10}
        className={sortKey === col && sortDir === 'desc' ? 'text-primary' : 'text-border'}
      />
    </span>
  );

  const statuses: TaskStatus[] = ['pending', 'scheduled', 'in-progress', 'completed', 'missed', 'rescheduled', 'upcoming'];

  return (
    <>
      <div className="card flex flex-col">
        {/* Table header controls */}
        <div className="p-4 border-b border-border">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Icon name="MagnifyingGlassIcon" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tasks or goals…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9 h-9 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Status filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field h-9 text-sm w-auto py-0 pr-7"
              >
                <option value="all">All Statuses</option>
                {statuses.map((s) => (
                  <option key={`filter-status-${s}`} value={s}>
                    {statusConfig[s].label}
                  </option>
                ))}
              </select>

              {/* Priority filter */}
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="input-field h-9 text-sm w-auto py-0 pr-7"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              {/* Goal filter */}
              <select
                value={filterGoal}
                onChange={(e) => setFilterGoal(e.target.value)}
                className="input-field h-9 text-sm w-auto py-0 pr-7 max-w-[180px]"
              >
                <option value="all">All Goals</option>
                {uniqueGoals.map((g) => (
                  <option key={`filter-goal-${g}`} value={g}>{g}</option>
                ))}
              </select>

              {/* Create task */}
              <button
                onClick={() => setModalOpen(true)}
                className="btn-primary h-9 text-sm flex items-center gap-1.5"
              >
                <Icon name="PlusIcon" size={15} />
                Add Task
              </button>
            </div>
          </div>

          {/* Result count */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground tabular-nums">{filtered.length}</span> of{' '}
              <span className="font-semibold text-foreground tabular-nums">{taskList.length}</span> tasks
            </span>
            {(filterStatus !== 'all' || filterPriority !== 'all' || filterGoal !== 'all' || search) && (
              <button
                onClick={() => { setSearch(''); setFilterStatus('all'); setFilterPriority('all'); setFilterGoal('all'); }}
                className="text-xs text-primary font-medium hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                    aria-label="Select all tasks"
                  />
                </th>
                {[
                  { key: 'title' as keyof Task, label: 'Task Name', width: 'w-52' },
                  { key: 'goal' as keyof Task, label: 'Goal', width: 'w-40' },
                  { key: 'priority' as keyof Task, label: 'Priority', width: 'w-28' },
                  { key: 'status' as keyof Task, label: 'Status', width: 'w-32' },
                  { key: 'estimatedDuration' as keyof Task, label: 'Duration', width: 'w-24' },
                  { key: 'scheduledDate' as keyof Task, label: 'Scheduled', width: 'w-28' },
                  { key: 'deadline' as keyof Task, label: 'Deadline', width: 'w-24' },
                  { key: 'dependency' as keyof Task, label: 'Depends On', width: 'w-28' },
                ].map((col) => (
                  <th
                    key={`th-${col.key}`}
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none ${col.width}`}
                    onClick={() => toggleSort(col.key)}
                  >
                    <span className="inline-flex items-center gap-0.5">
                      {col.label}
                      <SortIcon col={col.key} />
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground w-20">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center">
                        <Icon name="ClipboardDocumentListIcon" size={24} className="text-muted-foreground" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">No tasks match your filters</p>
                      <p className="text-xs text-muted-foreground">Try adjusting your search or filter criteria</p>
                      <button
                        onClick={() => { setSearch(''); setFilterStatus('all'); setFilterPriority('all'); setFilterGoal('all'); }}
                        className="btn-secondary text-sm h-8 px-4"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((task, idx) => {
                  const sc = statusConfig[task.status];
                  const pc = priorityConfig[task.priority];
                  const isSelected = selectedRows.has(task.id);
                  const isDeleting = deletingId === task.id;
                  const depTask = task.dependency ? taskList.find((t) => t.id === task.dependency) : null;

                  return (
                    <tr
                      key={task.id}
                      className={`border-b border-border transition-all duration-200 group ${
                        isDeleting ? 'row-exit' : ''
                      } ${
                        isSelected ? 'bg-secondary/50' : idx % 2 === 0 ? 'bg-card' : 'bg-muted/20'
                      } hover:bg-muted/50`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(task.id)}
                          className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                          aria-label={`Select ${task.title}`}
                        />
                      </td>

                      {/* Task name */}
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium text-foreground leading-tight ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </p>
                            {task.aiSuggested && (
                              <span className="inline-flex items-center gap-0.5 text-xs text-info mt-0.5">
                                <Icon name="SparklesIcon" size={10} className="text-info" />
                                AI scheduled
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Goal */}
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground truncate block max-w-[140px]" title={task.goal}>
                          {task.goal}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-3">
                        <span className={`text-xs ${pc.color}`}>{pc.label}</span>
                      </td>

                      {/* Status — inline dropdown */}
                      <td className="px-4 py-3 relative">
                        <button
                          onClick={() => setStatusDropdownId(statusDropdownId === task.id ? null : task.id)}
                          className="hover:opacity-80 transition-opacity"
                          aria-label={`Change status of ${task.title}`}
                        >
                          <Badge variant={sc.variant} dot>{sc.label}</Badge>
                        </button>
                        {statusDropdownId === task.id && (
                          <div className="absolute z-30 top-full left-0 mt-1 bg-card border border-border rounded-xl shadow-elevated py-1.5 min-w-[160px] fade-in">
                            {statuses.map((s) => (
                              <button
                                key={`status-opt-${task.id}-${s}`}
                                onClick={() => handleStatusChange(task.id, s)}
                                className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-muted transition-colors flex items-center gap-2 ${
                                  task.status === s ? 'text-primary bg-secondary/50' : 'text-foreground'
                                }`}
                              >
                                <Badge variant={statusConfig[s].variant}>{statusConfig[s].label}</Badge>
                              </button>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Duration */}
                      <td className="px-4 py-3">
                        <span className="text-sm text-foreground tabular-nums">{task.estimatedDuration}</span>
                      </td>

                      {/* Scheduled */}
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-xs text-foreground tabular-nums">{task.scheduledDate}</p>
                          <p className="text-xs text-muted-foreground tabular-nums">{task.scheduledTime}</p>
                        </div>
                      </td>

                      {/* Deadline */}
                      <td className="px-4 py-3">
                        <span className="text-xs text-foreground tabular-nums">{task.deadline}</span>
                      </td>

                      {/* Dependency */}
                      <td className="px-4 py-3">
                        {depTask ? (
                          <span className="text-xs text-muted-foreground truncate block max-w-[100px]" title={depTask.title}>
                            ↳ {depTask.title.slice(0, 18)}…
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <button
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                            title="Edit task"
                            aria-label={`Edit ${task.title}`}
                          >
                            <Icon name="PencilSquareIcon" size={15} className="text-muted-foreground" />
                          </button>
                          <button
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                            title="Ask AI to reschedule this task"
                            aria-label={`Reschedule ${task.title} with AI`}
                          >
                            <Icon name="SparklesIcon" size={15} className="text-info" />
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="p-1.5 rounded-lg hover:bg-danger-bg transition-colors"
                            title="Delete task — this cannot be undone"
                            aria-label={`Delete ${task.title}`}
                          >
                            <Icon name="TrashIcon" size={15} className="text-danger" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-border flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground tabular-nums">{filtered.length}</span> tasks
            </span>
            <select className="input-field h-8 text-xs py-0 w-auto pr-6">
              <option>25 per page</option>
              <option>50 per page</option>
              <option>100 per page</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            {['page-prev', 'page-1', 'page-2', 'page-3', 'page-next'].map((p) => (
              <button
                key={p}
                className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  p === 'page-1' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {p === 'page-prev' ? '←' : p === 'page-next' ? '→' : p.replace('page-', '')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedRows.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 slide-up">
          <div className="bg-foreground text-background rounded-2xl shadow-modal px-5 py-3 flex items-center gap-4">
            <span className="text-sm font-semibold tabular-nums">{selectedRows.size} selected</span>
            <div className="w-px h-5 bg-background/20" />
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setTaskList((prev) =>
                    prev.map((t) =>
                      selectedRows.has(t.id) ? { ...t, status: 'completed' } : t
                    )
                  );
                  toast.success(`${selectedRows.size} tasks marked as completed.`);
                  setSelectedRows(new Set());
                }}
                className="flex items-center gap-1.5 bg-success/20 text-success rounded-xl px-3 py-1.5 text-xs font-semibold hover:bg-success/30 transition-all"
              >
                <Icon name="CheckIcon" size={13} />
                Mark Done
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 bg-danger/20 text-danger rounded-xl px-3 py-1.5 text-xs font-semibold hover:bg-danger/30 transition-all"
              >
                <Icon name="TrashIcon" size={13} />
                Delete All
              </button>
              <button
                onClick={() => setSelectedRows(new Set())}
                className="text-background/60 hover:text-background text-xs font-medium transition-colors px-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); reset(); }}
        title="Create New Task"
        subtitle="Add a task to your schedule — the AI will find the best time slot"
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => { setModalOpen(false); reset(); }}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-task-form"
              className="btn-primary flex items-center gap-2"
            >
              <Icon name="PlusIcon" size={15} />
              Create Task
            </button>
          </>
        }
      >
        <form id="create-task-form" onSubmit={handleSubmit(onCreateTask)} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Task title */}
            <div className="md:col-span-2">
              <label className="label" htmlFor="task-title">Task name</label>
              <input
                id="task-title"
                type="text"
                className="input-field"
                placeholder="e.g. Study Chapter 3 — Process Scheduling"
                {...register('title', { required: 'Task name is required' })}
              />
              {errors.title && <p className="error-text">{errors.title.message}</p>}
            </div>

            {/* Goal */}
            <div>
              <label className="label" htmlFor="task-goal">Goal</label>
              <p className="helper-text -mt-1 mb-1.5">Which goal does this task belong to?</p>
              <select id="task-goal" className="input-field" {...register('goal', { required: 'Please select a goal' })}>
                <option value="">Select a goal…</option>
                {uniqueGoals.map((g) => (
                  <option key={`modal-goal-${g}`} value={g}>{g}</option>
                ))}
                <option value="new">+ Create new goal</option>
              </select>
              {errors.goal && <p className="error-text">{errors.goal.message}</p>}
            </div>

            {/* Priority */}
            <div>
              <label className="label" htmlFor="task-priority">Priority</label>
              <p className="helper-text -mt-1 mb-1.5">Higher priority tasks are scheduled first</p>
              <select id="task-priority" className="input-field" {...register('priority')}>
                <option value="critical">⚑ Critical — must be done</option>
                <option value="high">↑ High — important deadline</option>
                <option value="medium">→ Medium — standard task</option>
                <option value="low">↓ Low — do when possible</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="label" htmlFor="task-duration">Estimated duration</label>
              <p className="helper-text -mt-1 mb-1.5">How long will this task take?</p>
              <select id="task-duration" className="input-field" {...register('estimatedDuration', { required: 'Duration is required' })}>
                <option value="">Select duration…</option>
                <option value="15m">15 minutes</option>
                <option value="30m">30 minutes</option>
                <option value="45m">45 minutes</option>
                <option value="1h">1 hour</option>
                <option value="1h 30m">1 hour 30 minutes</option>
                <option value="2h">2 hours</option>
                <option value="2h 30m">2 hours 30 minutes</option>
                <option value="3h">3 hours</option>
                <option value="4h">4 hours</option>
              </select>
              {errors.estimatedDuration && <p className="error-text">{errors.estimatedDuration.message}</p>}
            </div>

            {/* Deadline */}
            <div>
              <label className="label" htmlFor="task-deadline">Deadline</label>
              <p className="helper-text -mt-1 mb-1.5">When must this task be completed by?</p>
              <input
                id="task-deadline"
                type="date"
                className="input-field"
                {...register('deadline', { required: 'Deadline is required' })}
              />
              {errors.deadline && <p className="error-text">{errors.deadline.message}</p>}
            </div>

            {/* Preferred date */}
            <div>
              <label className="label" htmlFor="task-scheduled-date">Preferred date</label>
              <p className="helper-text -mt-1 mb-1.5">Leave blank to let AI choose the best slot</p>
              <input
                id="task-scheduled-date"
                type="date"
                className="input-field"
                {...register('scheduledDate')}
              />
            </div>

            {/* Preferred time */}
            <div>
              <label className="label" htmlFor="task-scheduled-time">Preferred start time</label>
              <p className="helper-text -mt-1 mb-1.5">Optional — AI will respect your availability</p>
              <input
                id="task-scheduled-time"
                type="time"
                className="input-field"
                {...register('scheduledTime')}
              />
            </div>

            {/* Dependency */}
            <div className="md:col-span-2">
              <label className="label" htmlFor="task-dependency">Depends on (optional)</label>
              <p className="helper-text -mt-1 mb-1.5">This task can only start after the selected task is completed</p>
              <select id="task-dependency" className="input-field" {...register('dependency')}>
                <option value="">No dependency</option>
                {taskList.map((t) => (
                  <option key={`dep-opt-${t.id}`} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="label" htmlFor="task-notes">Notes (optional)</label>
              <textarea
                id="task-notes"
                rows={3}
                className="input-field resize-none"
                placeholder="Any additional context for this task…"
                {...register('notes')}
              />
            </div>
          </div>

          {/* AI hint */}
          <div className="mt-4 flex items-start gap-2.5 bg-info-bg border border-info/20 rounded-xl p-3">
            <Icon name="SparklesIcon" size={15} className="text-info flex-shrink-0 mt-0.5" />
            <p className="text-xs text-info leading-relaxed">
              <span className="font-semibold">AI Scheduling:</span> After creating this task, PlanWise AI will analyze your existing schedule, deadlines, and workload to suggest the optimal time slot. You&apos;ll review and approve before it&apos;s added.
            </p>
          </div>
        </form>
      </Modal>
    </>
  );
}