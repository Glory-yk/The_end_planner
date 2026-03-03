'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Plus, Circle, CheckCircle2, Trash2, Loader2, Edit3, Check, X } from 'lucide-react';
import { Project } from '@/api/projects/projects';
import { Task } from '@/types/task';
import taskApi from '@/api/taskApi';
import { useAppStore } from '@/hooks/useAppStore';

interface ProjectDetailViewProps {
    project: Project;
    onBack: () => void;
}

export const ProjectDetailView = ({ project, onBack }: ProjectDetailViewProps) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const { deleteTask, toggleTask } = useAppStore();

    const loadTasks = useCallback(async () => {
        setIsLoading(true);
        try {
            // 전체 태스크에서 projectId로 필터링
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

    const handleAddTask = async () => {
        if (!newTaskTitle.trim()) return;
        setIsAddingTask(true);
        try {
            const created = await taskApi.create({
                title: newTaskTitle.trim(),
                isCompleted: false,
                scheduledDate: null,
                projectId: project.id,
            });
            setTasks(prev => [created, ...prev]);
            setNewTaskTitle('');
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

    const pending = tasks.filter(t => !t.isCompleted);
    const completed = tasks.filter(t => t.isCompleted);

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
                <span className="ml-auto text-sm text-gray-400 dark:text-slate-500">
                    {pending.length}개 남음
                </span>
            </div>

            {/* Add Task Input */}
            <div className="px-6 py-3 border-b border-gray-100 dark:border-slate-800/50">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                    <Plus className="w-4 h-4 text-gray-400 dark:text-slate-500 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="새 할 일 추가..."
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                        className="flex-1 bg-transparent text-sm text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 outline-none"
                    />
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
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
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
}

const TaskRow = ({
    task, editingTaskId, editingTitle,
    setEditingTaskId, setEditingTitle,
    onToggle, onDelete, onEditSave
}: TaskRowProps) => {
    const isEditing = editingTaskId === task.id;

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

            {isEditing ? (
                <input
                    autoFocus
                    value={editingTitle}
                    onChange={e => setEditingTitle(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') onEditSave(task.id);
                        if (e.key === 'Escape') setEditingTaskId(null);
                    }}
                    className="flex-1 text-sm bg-white dark:bg-slate-800 border border-primary/50 rounded-lg px-2 py-1 outline-none text-gray-900 dark:text-white"
                />
            ) : (
                <span
                    onDoubleClick={() => { setEditingTaskId(task.id); setEditingTitle(task.title); }}
                    className={`flex-1 text-sm ${task.isCompleted ? 'line-through text-gray-400 dark:text-slate-600' : 'text-gray-800 dark:text-slate-200'}`}
                >
                    {task.title}
                </span>
            )}

            {isEditing ? (
                <div className="flex gap-1">
                    <button onClick={() => onEditSave(task.id)} className="p-1 text-primary hover:bg-primary/10 rounded"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditingTaskId(null)} className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded"><X className="w-4 h-4" /></button>
                </div>
            ) : (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
