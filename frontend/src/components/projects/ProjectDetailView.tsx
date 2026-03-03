'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    ArrowLeft, Plus, Circle, CheckCircle2, Trash2, Loader2,
    Edit3, Check, X, CalendarDays, RefreshCw, Calendar
} from 'lucide-react';
import { Project } from '@/api/projects/projects';
import { Task } from '@/types/task';
import taskApi from '@/api/taskApi';
import { calendarApi } from '@/api/calendarApi';
import { useAppStore } from '@/hooks/useAppStore';

interface ProjectDetailViewProps {
    project: Project;
    onBack: () => void;
}

export const ProjectDetailView = ({ project, onBack }: ProjectDetailViewProps) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDate, setNewTaskDate] = useState('');
    const [newTaskTime, setNewTaskTime] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [isSyncingProject, setIsSyncingProject] = useState(false);
    const [syncMessage, setSyncMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const { deleteTask, toggleTask } = useAppStore();

    const loadTasks = useCallback(async () => {
        setIsLoading(true);
        try {
            const allTasks = await taskApi.getAll();
            const projectTasks = allTasks.filter(t => t.projectId === project.id);
            setTasks(projectTasks);
        } catch (err) {
            console.error('Failed to load project tasks:', err);
        } finally {
            setIsLoading(false);
        }
    }, [project.id]);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    // 메시지 자동 사라짐
    useEffect(() => {
        if (syncMessage) {
            const timer = setTimeout(() => setSyncMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [syncMessage]);

    const handleAddTask = async () => {
        if (!newTaskTitle.trim()) return;
        setIsAddingTask(true);
        try {
            const created = await taskApi.create({
                title: newTaskTitle.trim(),
                isCompleted: false,
                scheduledDate: newTaskDate || null,
                startTime: newTaskTime || null,
                projectId: project.id,
            });
            setTasks(prev => [created, ...prev]);
            setNewTaskTitle('');
            setNewTaskDate('');
            setNewTaskTime('');
            setShowDatePicker(false);
        } catch (err) {
            console.error('Failed to create task:', err);
        } finally {
            setIsAddingTask(false);
        }
    };

    const handleToggle = async (task: Task) => {
        try {
            await toggleTask(task.id);
            setTasks(prev => prev.map(t => t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t));
        } catch (err) {
            console.error('Failed to toggle task:', err);
        }
    };

    const handleDelete = async (taskId: string) => {
        try {
            await deleteTask(taskId);
            setTasks(prev => prev.filter(t => t.id !== taskId));
        } catch (err) {
            console.error('Failed to delete task:', err);
        }
    };

    const handleEditSave = async (taskId: string) => {
        if (!editingTitle.trim()) return;
        try {
            const updated = await taskApi.update(taskId, { title: editingTitle.trim() });
            setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
            setEditingTaskId(null);
        } catch (err) {
            console.error('Failed to update task:', err);
        }
    };

    // 개별 태스크 캘린더 동기화
    const handleSyncTask = async (taskId: string) => {
        try {
            const result = await calendarApi.syncTask(taskId);
            setSyncMessage({ text: result.message, type: 'success' });
        } catch (err: any) {
            const msg = err?.response?.data?.message || '캘린더 등록에 실패했습니다';
            setSyncMessage({ text: msg, type: 'error' });
        }
    };

    // 프로젝트 전체 캘린더 동기화
    const handleSyncProject = async () => {
        setIsSyncingProject(true);
        try {
            const result = await calendarApi.syncProject(project.id);
            setSyncMessage({ text: result.message, type: 'success' });
        } catch (err: any) {
            const msg = err?.response?.data?.message || '캘린더 동기화에 실패했습니다';
            setSyncMessage({ text: msg, type: 'error' });
        } finally {
            setIsSyncingProject(false);
        }
    };

    const pending = tasks.filter(t => !t.isCompleted);
    const completed = tasks.filter(t => t.isCompleted);
    const tasksWithDate = tasks.filter(t => t.scheduledDate && !t.isCompleted).length;

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-950">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-slate-800">
                <button
                    onClick={onBack}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">#</span>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <span className="text-sm text-gray-400 dark:text-slate-500">
                        {pending.length}개 남음
                    </span>
                    {/* 프로젝트 전체 캘린더 동기화 버튼 */}
                    <button
                        onClick={handleSyncProject}
                        disabled={isSyncingProject || tasksWithDate === 0}
                        title={tasksWithDate === 0 ? '날짜가 있는 태스크가 없습니다' : `날짜 있는 태스크 ${tasksWithDate}개 캘린더 동기화`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                        {isSyncingProject
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <RefreshCw className="w-3.5 h-3.5" />
                        }
                        전체 동기화
                    </button>
                </div>
            </div>

            {/* Sync result message */}
            {syncMessage && (
                <div className={`mx-6 mt-3 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${syncMessage.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                    }`}>
                    <CalendarDays className="w-4 h-4 flex-shrink-0" />
                    {syncMessage.text}
                </div>
            )}

            {/* Add Task Input */}
            <div className="px-6 py-3 border-b border-gray-100 dark:border-slate-800/50">
                <div className="flex flex-col gap-2 p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                    <div className="flex items-center gap-3">
                        <Plus className="w-4 h-4 text-gray-400 dark:text-slate-500 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="새 할 일 추가..."
                            value={newTaskTitle}
                            onChange={e => setNewTaskTitle(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !showDatePicker && handleAddTask()}
                            className="flex-1 bg-transparent text-sm text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 outline-none"
                        />
                        <button
                            onClick={() => setShowDatePicker(v => !v)}
                            className={`p-1.5 rounded-lg transition-colors ${showDatePicker ? 'text-primary bg-primary/10' : 'text-gray-400 hover:text-gray-600 dark:hover:text-slate-300'}`}
                            title="날짜/시간 설정"
                        >
                            <Calendar className="w-4 h-4" />
                        </button>
                        {newTaskTitle.trim() && (
                            <button
                                onClick={handleAddTask}
                                disabled={isAddingTask}
                                className="px-3 py-1 text-xs font-medium bg-primary text-white rounded-lg disabled:opacity-50 transition-opacity"
                            >
                                {isAddingTask ? <Loader2 className="w-3 h-3 animate-spin" /> : '추가'}
                            </button>
                        )}
                    </div>
                    {/* 날짜/시간 입력 */}
                    {showDatePicker && (
                        <div className="flex items-center gap-2 pt-1 pl-7">
                            <input
                                type="date"
                                value={newTaskDate}
                                onChange={e => setNewTaskDate(e.target.value)}
                                className="text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-gray-700 dark:text-slate-300 outline-none focus:border-primary/50"
                            />
                            <input
                                type="time"
                                value={newTaskTime}
                                onChange={e => setNewTaskTime(e.target.value)}
                                className="text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-gray-700 dark:text-slate-300 outline-none focus:border-primary/50 w-28"
                            />
                            {newTaskDate && (
                                <span className="text-xs text-blue-500 flex items-center gap-1">
                                    <CalendarDays className="w-3 h-3" />
                                    캘린더 알람 설정됨
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400 dark:text-slate-600">
                        <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                            <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <p className="text-sm font-medium">할 일이 없습니다</p>
                        <p className="text-xs">위에서 새 할 일을 추가해보세요</p>
                    </div>
                ) : (
                    <>
                        {/* Pending Tasks */}
                        {pending.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3">진행 중 ({pending.length})</h3>
                                <div className="flex flex-col gap-1">
                                    {pending.map(task => (
                                        <TaskRow
                                            key={task.id}
                                            task={task}
                                            editingTaskId={editingTaskId}
                                            editingTitle={editingTitle}
                                            setEditingTaskId={setEditingTaskId}
                                            setEditingTitle={setEditingTitle}
                                            onToggle={handleToggle}
                                            onDelete={handleDelete}
                                            onEditSave={handleEditSave}
                                            onSyncCalendar={handleSyncTask}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Completed Tasks */}
                        {completed.length > 0 && (
                            <div>
                                <h3 className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3">완료됨 ({completed.length})</h3>
                                <div className="flex flex-col gap-1 opacity-60">
                                    {completed.map(task => (
                                        <TaskRow
                                            key={task.id}
                                            task={task}
                                            editingTaskId={editingTaskId}
                                            editingTitle={editingTitle}
                                            setEditingTaskId={setEditingTaskId}
                                            setEditingTitle={setEditingTitle}
                                            onToggle={handleToggle}
                                            onDelete={handleDelete}
                                            onEditSave={handleEditSave}
                                            onSyncCalendar={handleSyncTask}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Calendar hint footer */}
            <div className="px-6 py-3 border-t border-gray-100 dark:border-slate-800/50 flex items-center gap-2 text-xs text-gray-400 dark:text-slate-600">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>날짜 있는 태스크의 🗓️ 버튼으로 구글 캘린더에 알람을 설정하세요 (팝업 10분 전)</span>
            </div>
        </div>
    );
};

/* ── Sub-component: TaskRow ── */
interface TaskRowProps {
    task: Task;
    editingTaskId: string | null;
    editingTitle: string;
    setEditingTaskId: (id: string | null) => void;
    setEditingTitle: (t: string) => void;
    onToggle: (task: Task) => void;
    onDelete: (id: string) => void;
    onEditSave: (id: string) => void;
    onSyncCalendar: (id: string) => void;
}

const TaskRow = ({
    task, editingTaskId, editingTitle,
    setEditingTaskId, setEditingTitle,
    onToggle, onDelete, onEditSave, onSyncCalendar
}: TaskRowProps) => {
    const isEditing = editingTaskId === task.id;
    const [isSyncing, setIsSyncing] = useState(false);

    const handleCalendarSync = async () => {
        setIsSyncing(true);
        try {
            await onSyncCalendar(task.id);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors">
            <button
                onClick={() => onToggle(task)}
                className="flex-shrink-0 text-gray-300 dark:text-slate-600 hover:text-primary transition-colors"
            >
                {task.isCompleted
                    ? <CheckCircle2 className="w-5 h-5 text-primary" />
                    : <Circle className="w-5 h-5" />
                }
            </button>

            <div className="flex-1 min-w-0">
                {isEditing ? (
                    <input
                        autoFocus
                        value={editingTitle}
                        onChange={e => setEditingTitle(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') onEditSave(task.id);
                            if (e.key === 'Escape') setEditingTaskId(null);
                        }}
                        className="w-full text-sm bg-white dark:bg-slate-800 border border-primary/50 rounded-lg px-2 py-1 outline-none text-gray-900 dark:text-white"
                    />
                ) : (
                    <div>
                        <span
                            onDoubleClick={() => { setEditingTaskId(task.id); setEditingTitle(task.title); }}
                            className={`block text-sm ${task.isCompleted ? 'line-through text-gray-400 dark:text-slate-600' : 'text-gray-800 dark:text-slate-200'}`}
                        >
                            {task.title}
                        </span>
                        {task.scheduledDate && (
                            <div className="flex items-center gap-1 mt-0.5">
                                <CalendarDays className="w-3 h-3 text-blue-400" />
                                <span className="text-xs text-blue-400">
                                    {task.scheduledDate}{task.startTime ? ` ${task.startTime}` : ''}
                                </span>
                                {task.googleEventId && (
                                    <span className="text-xs text-green-500 ml-1">✓ 캘린더 등록됨</span>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isEditing ? (
                <div className="flex gap-1">
                    <button onClick={() => onEditSave(task.id)} className="p-1 text-primary hover:bg-primary/10 rounded"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditingTaskId(null)} className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded"><X className="w-4 h-4" /></button>
                </div>
            ) : (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* 캘린더 등록 버튼 - 날짜가 있을 때만 표시 */}
                    {task.scheduledDate && (
                        <button
                            onClick={handleCalendarSync}
                            disabled={isSyncing}
                            title="구글 캘린더에 등록 (알람 포함)"
                            className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded transition-colors disabled:opacity-50"
                        >
                            {isSyncing
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <CalendarDays className="w-3.5 h-3.5" />
                            }
                        </button>
                    )}
                    <button
                        onClick={() => { setEditingTaskId(task.id); setEditingTitle(task.title); }}
                        className="p-1 text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors"
                    >
                        <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => onDelete(task.id)}
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
};
