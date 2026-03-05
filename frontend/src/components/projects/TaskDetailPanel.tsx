'use client';

import { useState, useEffect, useRef } from 'react';
import {
    X, Circle, CheckCircle2, Plus, Flag, CalendarDays,
    AlarmClock, MapPin, Tag, ChevronDown, ChevronRight,
    MoreHorizontal, Eye, EyeOff
} from 'lucide-react';
import { Task } from '@/types/task';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    return `${y}년 ${m}월 ${day}일`;
}

function today(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const PRIORITY_CONFIG = [
    { value: 0, label: '우선 순위 없음', short: '–', color: '#9ca3af' },
    { value: 1, label: 'P3', short: 'P3', color: '#3b82f6' },
    { value: 2, label: 'P2', short: 'P2', color: '#f59e0b' },
    { value: 3, label: 'P1', short: 'P1', color: '#ef4444' },
] as const;

// ── Sub-task row ──────────────────────────────────────────────────────────────

interface SubTaskRowProps {
    task: Task;
    projectColor?: string | null;
    onToggle: (task: Task) => void;
    onDelete: (id: string) => void;
}

const SubTaskRow = ({ task, projectColor, onToggle, onDelete }: SubTaskRowProps) => {
    const color = projectColor || '#ef4444';
    return (
        <div className="flex items-center gap-2.5 py-1.5 group rounded-lg hover:bg-white/5 px-1 -mx-1 transition-colors">
            <button
                onClick={() => onToggle(task)}
                className="flex-shrink-0 transition-colors"
                style={{ color }}
            >
                {task.isCompleted
                    ? <CheckCircle2 style={{ width: 16, height: 16 }} />
                    : <Circle style={{ width: 16, height: 16 }} />
                }
            </button>
            <span
                className={`flex-1 text-sm leading-snug ${task.isCompleted
                    ? 'line-through text-gray-500 dark:text-slate-600'
                    : 'text-gray-800 dark:text-slate-200'
                    }`}
            >
                {task.title}
            </span>
            <button
                onClick={() => onDelete(task.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-0.5 rounded"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
};

// ── Property row ──────────────────────────────────────────────────────────────

interface PropRowProps {
    label: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    onClick?: () => void;
}

const PropRow = ({ label, icon, children, onClick }: PropRowProps) => (
    <div
        className={`flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-slate-800 ${onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-lg px-2 -mx-2 transition-colors' : ''}`}
        onClick={onClick}
    >
        <span className="text-gray-400 dark:text-slate-500 flex-shrink-0 w-4">{icon}</span>
        <span className="text-sm text-gray-500 dark:text-slate-400 w-20 flex-shrink-0">{label}</span>
        <span className="text-sm flex-1">{children}</span>
    </div>
);

// ── Main component ────────────────────────────────────────────────────────────

export interface TaskDetailPanelProps {
    task: Task;
    allTasks: Task[];            // to find sub-tasks (indent > task.indent && siblings)
    projectName: string;
    projectColor?: string | null;
    onClose: () => void;
    onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
    onToggleTask: (task: Task) => void;
    onDeleteTask: (id: string) => void;
    onAddSubtask: (parentId: string, title: string) => Promise<void>;
}

export const TaskDetailPanel = ({
    task,
    allTasks,
    projectName,
    projectColor,
    onClose,
    onUpdateTask,
    onToggleTask,
    onDeleteTask,
    onAddSubtask,
}: TaskDetailPanelProps) => {
    const color = projectColor || '#ef4444';

    // ── Local editable state ──────────────────────────────────────────────────
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || '');
    const [showCompleted, setShowCompleted] = useState(false);
    const [isAddingSubtask, setIsAddingSubtask] = useState(false);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
    const [showPriorityMenu, setShowPriorityMenu] = useState(false);
    const [commentText, setCommentText] = useState('');

    const subtaskInputRef = useRef<HTMLInputElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    // Sync when task changes
    useEffect(() => {
        setTitle(task.title);
        setDescription(task.description || '');
    }, [task.id]);

    // ── Sub-tasks ─────────────────────────────────────────────────────────────

    const taskIdx = allTasks.findIndex(t => t.id === task.id);
    const taskDepth = task.indent ?? 0;

    const subtasks: Task[] = [];
    for (let i = taskIdx + 1; i < allTasks.length; i++) {
        const d = allTasks[i].indent ?? 0;
        if (d <= taskDepth) break;
        if (d === taskDepth + 1) subtasks.push(allTasks[i]);
    }

    const activeSubtasks = subtasks.filter(t => !t.isCompleted);
    const completedSubtasks = subtasks.filter(t => t.isCompleted);

    // ── Save handlers ─────────────────────────────────────────────────────────

    const saveTitle = () => {
        if (title.trim() && title.trim() !== task.title) {
            onUpdateTask(task.id, { title: title.trim() });
        }
    };

    const saveDescription = () => {
        if (description !== (task.description || '')) {
            onUpdateTask(task.id, { description: description || undefined });
        }
    };

    const handleAddSubtask = async () => {
        if (!newSubtaskTitle.trim()) return;
        await onAddSubtask(task.id, newSubtaskTitle.trim());
        setNewSubtaskTitle('');
        setIsAddingSubtask(false);
    };

    // Priority config
    const priorityOpt = PRIORITY_CONFIG.find(p => p.value === (task.priority ?? 0)) ?? PRIORITY_CONFIG[0];

    // Backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex"
            onClick={handleBackdropClick}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

            {/* Panel */}
            <div
                ref={panelRef}
                className="relative ml-auto h-full flex bg-white dark:bg-slate-950 shadow-2xl"
                style={{ width: '80vw', maxWidth: 900, minWidth: 600 }}
                onClick={e => e.stopPropagation()}
            >
                {/* ── Left pane ─────────────────────────────────────────────────── */}
                <div className="flex-1 flex flex-col min-w-0 border-r border-gray-100 dark:border-slate-800">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex-shrink-0">
                        <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-slate-500">
                            <span
                                className="font-medium"
                                style={{ color }}
                            >
                                # {projectName}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={onClose}
                                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                        {/* Checkbox + Title */}
                        <div className="flex items-start gap-3">
                            <button
                                onClick={() => onToggleTask(task)}
                                className="flex-shrink-0 mt-0.5 transition-colors"
                                style={{ color }}
                            >
                                {task.isCompleted
                                    ? <CheckCircle2 style={{ width: 22, height: 22 }} />
                                    : <Circle style={{ width: 22, height: 22 }} />
                                }
                            </button>
                            <textarea
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                onBlur={saveTitle}
                                onKeyDown={e => e.key === 'Escape' && setTitle(task.title)}
                                rows={1}
                                className="flex-1 text-xl font-bold bg-transparent outline-none text-gray-900 dark:text-white resize-none leading-snug mt-0.5"
                                style={{ minHeight: 32 }}
                                onInput={e => {
                                    const t = e.currentTarget;
                                    t.style.height = 'auto';
                                    t.style.height = t.scrollHeight + 'px';
                                }}
                            />
                        </div>

                        {/* Description */}
                        <div className="mt-3 pl-9">
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                onBlur={saveDescription}
                                placeholder="= 설명"
                                rows={2}
                                className="w-full text-sm bg-transparent outline-none text-gray-500 dark:text-slate-400 placeholder-gray-300 dark:placeholder-slate-600 resize-none leading-relaxed"
                                onInput={e => {
                                    const t = e.currentTarget;
                                    t.style.height = 'auto';
                                    t.style.height = t.scrollHeight + 'px';
                                }}
                            />
                        </div>

                        {/* Sub-tasks section */}
                        {(subtasks.length > 0 || isAddingSubtask) && (
                            <div className="mt-5 pl-9">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                        하위 작업 {activeSubtasks.length}/{subtasks.length}
                                    </span>
                                    {completedSubtasks.length > 0 && (
                                        <button
                                            onClick={() => setShowCompleted(v => !v)}
                                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                                        >
                                            {showCompleted ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                            완료된 작업 {showCompleted ? '숨기기' : '보기'}
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-0">
                                    {/* Active sub-tasks */}
                                    {activeSubtasks.map(sub => (
                                        <SubTaskRow
                                            key={sub.id}
                                            task={sub}
                                            projectColor={color}
                                            onToggle={onToggleTask}
                                            onDelete={onDeleteTask}
                                        />
                                    ))}

                                    {/* Add subtask input */}
                                    {isAddingSubtask && (
                                        <div className="flex items-center gap-2 py-1.5">
                                            <Circle style={{ width: 16, height: 16, color }} className="flex-shrink-0" />
                                            <input
                                                ref={subtaskInputRef}
                                                autoFocus
                                                value={newSubtaskTitle}
                                                onChange={e => setNewSubtaskTitle(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') handleAddSubtask();
                                                    if (e.key === 'Escape') { setIsAddingSubtask(false); setNewSubtaskTitle(''); }
                                                }}
                                                onBlur={() => {
                                                    if (!newSubtaskTitle.trim()) { setIsAddingSubtask(false); }
                                                }}
                                                placeholder="하위 작업 추가..."
                                                className="flex-1 text-sm bg-transparent border-b border-primary/50 outline-none text-gray-800 dark:text-slate-200 pb-0.5"
                                            />
                                        </div>
                                    )}

                                    {/* Completed sub-tasks (collapsible) */}
                                    {showCompleted && completedSubtasks.map(sub => (
                                        <SubTaskRow
                                            key={sub.id}
                                            task={sub}
                                            projectColor={color}
                                            onToggle={onToggleTask}
                                            onDelete={onDeleteTask}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Add sub-task button */}
                        <div className="mt-3 pl-9">
                            <button
                                onClick={() => {
                                    setIsAddingSubtask(true);
                                    setTimeout(() => subtaskInputRef.current?.focus(), 50);
                                }}
                                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                                style={{ color: isAddingSubtask ? color : undefined }}
                            >
                                <Plus className="w-4 h-4" />
                                하위 작업 추가
                            </button>
                        </div>
                    </div>

                    {/* Comment bar */}
                    <div className="px-6 py-3 border-t border-gray-100 dark:border-slate-800 flex-shrink-0">
                        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700">
                            <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                style={{ backgroundColor: color }}
                            >
                                G
                            </div>
                            <input
                                type="text"
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                placeholder="댓글"
                                className="flex-1 text-sm bg-transparent outline-none text-gray-700 dark:text-slate-300 placeholder-gray-400 dark:placeholder-slate-500"
                            />
                        </div>
                    </div>
                </div>

                {/* ── Right pane (properties) ───────────────────────────────────── */}
                <div className="w-64 flex-shrink-0 px-5 py-5 overflow-y-auto">
                    {/* Project */}
                    <PropRow
                        label="프로젝트"
                        icon={<span className="text-xs font-bold">#</span>}
                    >
                        <span className="font-medium" style={{ color }}>{projectName}</span>
                    </PropRow>

                    {/* Date */}
                    <div className="relative">
                        <PropRow
                            label="날짜"
                            icon={<CalendarDays className="w-4 h-4" />}
                            onClick={() => setShowDatePicker(v => !v)}
                        >
                            {task.scheduledDate ? (
                                <span className="text-gray-700 dark:text-slate-300 font-medium">
                                    {formatDate(task.scheduledDate)}
                                </span>
                            ) : (
                                <span className="text-gray-300 dark:text-slate-600">+ 추가</span>
                            )}
                        </PropRow>
                        {showDatePicker && (
                            <div className="absolute right-0 mt-1 z-50 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl p-2">
                                <input
                                    type="date"
                                    defaultValue={task.scheduledDate || today()}
                                    onChange={e => {
                                        onUpdateTask(task.id, { scheduledDate: e.target.value || null });
                                        setShowDatePicker(false);
                                    }}
                                    className="text-xs bg-transparent border border-gray-200 dark:border-slate-600 rounded-lg px-2 py-1.5 outline-none text-gray-700 dark:text-slate-300 focus:border-primary/50"
                                />
                            </div>
                        )}
                    </div>

                    {/* Deadline */}
                    <div className="relative">
                        <PropRow
                            label="마감일"
                            icon={<AlarmClock className="w-4 h-4" />}
                            onClick={() => setShowDeadlinePicker(v => !v)}
                        >
                            {task.deadline ? (
                                <span className="text-red-500 font-medium">
                                    {formatDate(task.deadline)}
                                </span>
                            ) : (
                                <span className="text-gray-300 dark:text-slate-600">+ 추가</span>
                            )}
                        </PropRow>
                        {showDeadlinePicker && (
                            <div className="absolute right-0 mt-1 z-50 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl p-2">
                                <input
                                    type="date"
                                    defaultValue={task.deadline || today()}
                                    onChange={e => {
                                        onUpdateTask(task.id, { deadline: e.target.value || null });
                                        setShowDeadlinePicker(false);
                                    }}
                                    className="text-xs bg-transparent border border-gray-200 dark:border-slate-600 rounded-lg px-2 py-1.5 outline-none text-gray-700 dark:text-slate-300 focus:border-primary/50"
                                />
                            </div>
                        )}
                    </div>

                    {/* Priority */}
                    <div className="relative">
                        <PropRow
                            label="우선 순위"
                            icon={<Flag className="w-4 h-4" />}
                            onClick={() => setShowPriorityMenu(v => !v)}
                        >
                            {(task.priority ?? 0) > 0 ? (
                                <span
                                    className="flex items-center gap-1.5 font-semibold text-sm"
                                    style={{ color: priorityOpt.color }}
                                >
                                    <Flag className="w-3.5 h-3.5" />
                                    {priorityOpt.short}
                                </span>
                            ) : (
                                <span className="text-gray-300 dark:text-slate-600">+ 추가</span>
                            )}
                        </PropRow>
                        {showPriorityMenu && (
                            <div className="absolute right-0 mt-1 z-50 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden min-w-[140px]">
                                {PRIORITY_CONFIG.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => {
                                            onUpdateTask(task.id, { priority: opt.value });
                                            setShowPriorityMenu(false);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                        style={{ color: opt.color }}
                                    >
                                        <Flag className="w-4 h-4" />
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Category/Label */}
                    <PropRow
                        label="라벨"
                        icon={<Tag className="w-4 h-4" />}
                    >
                        {task.category ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300">
                                {task.category}
                            </span>
                        ) : (
                            <span className="text-gray-300 dark:text-slate-600">+ 추가</span>
                        )}
                    </PropRow>

                    {/* Reminder */}
                    <PropRow
                        label="미리 알림"
                        icon={<AlarmClock className="w-4 h-4" />}
                    >
                        <span className="text-gray-300 dark:text-slate-600">+ 추가</span>
                    </PropRow>

                    {/* Location */}
                    <PropRow
                        label="위치"
                        icon={<MapPin className="w-4 h-4" />}
                    >
                        <span className="text-gray-300 dark:text-slate-600">+ 추가</span>
                    </PropRow>
                </div>
            </div>
        </div>
    );
};
