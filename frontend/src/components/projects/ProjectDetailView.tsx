'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    ArrowLeft, Plus, Loader2, RefreshCw, CalendarDays, Calendar
} from 'lucide-react';
import { Project } from '@/api/projects/projects';
import { Task } from '@/types/task';
import taskApi from '@/api/taskApi';
import { calendarApi } from '@/api/calendarApi';
import { TreeTaskRow } from './TreeTaskRow';

interface ProjectDetailViewProps {
    project: Project;
    onBack: () => void;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Task를 indent 순서 기반으로 flat 렌더 순서로 반환 */
function buildFlatTree(tasks: Task[]): Task[] {
    // indent 기준으로 정렬 (priority 필드가 있으면 사용, 없으면 createdAt)
    return [...tasks].sort((a, b) => {
        const pa = a.priority ?? 0;
        const pb = b.priority ?? 0;
        return pa - pb || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
}

/** 주어진 task의 직계 자식들 반환 */
function getChildren(tasks: Task[], parentId: string): Task[] {
    // 트리 구조: 편의상 "같은 flat 목록에서 바로 다음 단계 자식" 찾기
    // parentId 필드가 없으므로 indent 기반 구조로 처리
    // 여기서는 task.projectId를 공유하고 indent > parent.indent 인 바로 다음 태스크들을 찾는다
    // 실제로는 순서(priority/createdAt)와 indent 조합으로 판단
    const parent = tasks.find(t => t.id === parentId);
    if (!parent) return [];
    const parentDepth = parent.indent ?? 0;
    const parentIdx = tasks.indexOf(parent);

    const children: Task[] = [];
    for (let i = parentIdx + 1; i < tasks.length; i++) {
        const d = tasks[i].indent ?? 0;
        if (d <= parentDepth) break; // 같은 레벨이거나 위 레벨이면 중단
        if (d === parentDepth + 1) children.push(tasks[i]);
    }
    return children;
}

/** 특정 id의 task와 그 모든 하위 task id 목록 반환 */
function getSubtreeIds(tasks: Task[], id: string): string[] {
    const task = tasks.find(t => t.id === id);
    if (!task) return [id];
    const depth = task.indent ?? 0;
    const idx = tasks.indexOf(task);
    const ids = [id];
    for (let i = idx + 1; i < tasks.length; i++) {
        if ((tasks[i].indent ?? 0) <= depth) break;
        ids.push(tasks[i].id);
    }
    return ids;
}

// ── Main Component ────────────────────────────────────────────────────────────

export const ProjectDetailView = ({ project, onBack }: ProjectDetailViewProps) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDate, setNewTaskDate] = useState('');
    const [newTaskTime, setNewTaskTime] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [addingChildOf, setAddingChildOf] = useState<string | null>(null); // 하위 태스크 추가 중인 부모 id
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
    const [syncMessage, setSyncMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [isSyncingProject, setIsSyncingProject] = useState(false);

    // DnD state
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'child' | null>(null);


    const loadTasks = useCallback(async () => {
        setIsLoading(true);
        try {
            const allTasks = await taskApi.getAll();
            const projectTasks = allTasks.filter(t => t.projectId === project.id);
            setTasks(buildFlatTree(projectTasks));
        } catch (err) {
            console.error('Failed to load project tasks:', err);
        } finally {
            setIsLoading(false);
        }
    }, [project.id]);

    useEffect(() => { loadTasks(); }, [loadTasks]);

    useEffect(() => {
        if (syncMessage) {
            const t = setTimeout(() => setSyncMessage(null), 3000);
            return () => clearTimeout(t);
        }
    }, [syncMessage]);

    // ── Actions ────────────────────────────────────────────────────────────────

    const handleAddTask = async (parentId?: string) => {
        if (!newTaskTitle.trim()) return;
        setIsAddingTask(true);
        try {
            const parentTask = parentId ? tasks.find(t => t.id === parentId) : null;
            const indent = parentTask ? (parentTask.indent ?? 0) + 1 : 0;

            // priority: 마지막 태스크보다 1 큰 값 (간단 구현)
            const maxPriority = tasks.reduce((m, t) => Math.max(m, t.priority ?? 0), 0);

            const created = await taskApi.create({
                title: newTaskTitle.trim(),
                isCompleted: false,
                scheduledDate: newTaskDate || null,
                startTime: newTaskTime || null,
                projectId: project.id,
                indent,
                priority: maxPriority + 1,
            });
            setTasks(prev => buildFlatTree([...prev, created]));
            setNewTaskTitle('');
            setNewTaskDate('');
            setNewTaskTime('');
            setShowDatePicker(false);
            setAddingChildOf(null);
        } catch (err) {
            console.error('Failed to create task:', err);
        } finally {
            setIsAddingTask(false);
        }
    };

    const handleToggle = async (task: Task) => {
        const newCompleted = !task.isCompleted;
        // Optimistic update
        setTasks((prev: Task[]) => prev.map((t: Task) => t.id === task.id ? { ...t, isCompleted: newCompleted } : t));
        try {
            await taskApi.update(task.id, { isCompleted: newCompleted });
        } catch (err) {
            console.error('Failed to toggle task:', err);
            // Revert on error
            setTasks((prev: Task[]) => prev.map((t: Task) => t.id === task.id ? { ...t, isCompleted: task.isCompleted } : t));
        }
    };

    const handleDelete = async (taskId: string) => {
        const toDelete = getSubtreeIds(tasks, taskId);
        // Optimistic update
        setTasks((prev: Task[]) => prev.filter((t: Task) => !toDelete.includes(t.id)));
        try {
            await Promise.all(toDelete.map(id => taskApi.delete(id)));
        } catch (err) {
            console.error('Failed to delete task:', err);
            // Revert on error
            loadTasks();
        }
    };

    const handleEditSave = async (taskId: string, title: string) => {
        try {
            const updated = await taskApi.update(taskId, { title });
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, title: updated.title } : t));
        } catch (err) {
            console.error('Failed to update task:', err);
        }
    };

    const handleCollapseToggle = (id: string) => {
        setCollapsed(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleAddChild = (parentId: string) => {
        setAddingChildOf(parentId);
        setNewTaskTitle('');
        // 자동 스크롤 + 포커스는 useEffect로
    };

    const handleIndentChange = async (taskId: string, newIndent: number) => {
        try {
            await taskApi.update(taskId, { indent: newIndent });
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, indent: newIndent } : t));
        } catch (err) {
            console.error('Failed to change indent:', err);
        }
    };

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

    // ── Drag & Drop ────────────────────────────────────────────────────────────

    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);
        setDraggedId(id);
    };

    const handleDragOver = (e: React.DragEvent, targetId: string, depth: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (targetId === draggedId) return;
        setDragOverId(targetId);

        // 마우스 Y 위치에 따라 before/after/child 결정
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const y = e.clientY - rect.top;
        const h = rect.height;
        if (y < h * 0.25) setDropPosition('before');
        else if (y > h * 0.75) setDropPosition('after');
        else setDropPosition('child');
    };

    const handleDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        const fromId = e.dataTransfer.getData('text/plain') || draggedId;
        if (!fromId || fromId === targetId) {
            resetDnD();
            return;
        }

        setTasks(prev => {
            const newTasks = [...prev];
            const fromIdx = newTasks.findIndex(t => t.id === fromId);
            const toIdx = newTasks.findIndex(t => t.id === targetId);
            if (fromIdx === -1 || toIdx === -1) return prev;

            const fromTask = { ...newTasks[fromIdx] };
            const toTask = newTasks[toIdx];

            // child drop: indent = toTask.indent + 1
            if (dropPosition === 'child') {
                fromTask.indent = (toTask.indent ?? 0) + 1;
            } else {
                fromTask.indent = toTask.indent ?? 0;
            }

            // Subtree 이동
            const subtreeIds = getSubtreeIds(newTasks, fromId);
            const subtree = subtreeIds.map(id => newTasks.find(t => t.id === id)!).filter(Boolean);
            const rest = newTasks.filter(t => !subtreeIds.includes(t.id));

            const insertIdx = rest.findIndex(t => t.id === targetId);
            if (insertIdx === -1) return prev;

            const insertAt = dropPosition === 'before' ? insertIdx : insertIdx + 1;
            rest.splice(insertAt, 0, ...subtree.map((t, i) => ({
                ...t,
                indent: i === 0 ? fromTask.indent : (t.indent ?? 0),
            })));

            // priority 재계산 후 서버 동기화
            const updated = rest.map((t, idx) => ({ ...t, priority: idx }));
            // 비동기로 서버 저장 (UI는 즉시 반영)
            taskApi.reorder(updated.map(t => t.id)).catch(console.error);

            // indent 변경된 것들도 서버에 저장
            updated.forEach(t => {
                const orig = prev.find(o => o.id === t.id);
                if (orig && orig.indent !== t.indent) {
                    taskApi.update(t.id, { indent: t.indent }).catch(console.error);
                }
            });

            return updated;
        });

        resetDnD();
    };

    const handleDragEnd = () => resetDnD();

    const resetDnD = () => {
        setDraggedId(null);
        setDragOverId(null);
        setDropPosition(null);
    };

    // ── Render helpers ─────────────────────────────────────────────────────────

    /** collapsed 상태 반영 + 완료된 태스크 제외 (완료 탭에서 별도 표시) */
    const getVisibleTasks = (): Task[] => {
        const visible: Task[] = [];
        let hiddenBelow = -1;

        for (const task of tasks) {
            if (task.isCompleted) continue; // 완료 태스크는 별도 탭에서 표시
            const depth = task.indent ?? 0;
            // collapsed 부모 하위면 skip
            if (hiddenBelow >= 0 && depth > hiddenBelow) continue;
            hiddenBelow = -1;
            visible.push(task);
            if (collapsed.has(task.id)) {
                hiddenBelow = depth;
            }
        }
        return visible;
    };

    const visibleTasks = getVisibleTasks();
    const pending = tasks.filter(t => !t.isCompleted);

    const getChildCount = (taskId: string) => getChildren(tasks, taskId).length;
    const getCompletedChildCount = (taskId: string) =>
        getChildren(tasks, taskId).filter(c => c.isCompleted).length;

    const hasChildren = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return false;
        const depth = task.indent ?? 0;
        const idx = tasks.indexOf(task);
        return idx + 1 < tasks.length && (tasks[idx + 1].indent ?? 0) > depth;
    };

    // 새 태스크 추가 input ref (addingChildOf 시 포커스)
    const addInputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (addingChildOf) {
            setTimeout(() => addInputRef.current?.focus(), 0);
        }
    }, [addingChildOf]);

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
                    <button
                        onClick={handleSyncProject}
                        disabled={isSyncingProject}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                        {isSyncingProject ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
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
                    {addingChildOf && (
                        <span className="text-xs text-gray-400 pl-7">
                            📎 하위 할 일 추가 중 —{' '}
                            <button
                                onClick={() => setAddingChildOf(null)}
                                className="text-primary underline"
                            >취소</button>
                        </span>
                    )}
                    <div className="flex items-center gap-3">
                        <Plus className="w-4 h-4 text-gray-400 dark:text-slate-500 flex-shrink-0" />
                        <input
                            ref={addInputRef}
                            type="text"
                            placeholder={addingChildOf ? "하위 할 일 제목..." : "새 할 일 추가..."}
                            value={newTaskTitle}
                            onChange={e => setNewTaskTitle(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !showDatePicker && handleAddTask(addingChildOf ?? undefined)}
                            className="flex-1 bg-transparent text-sm text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 outline-none"
                        />
                        <button
                            onClick={() => setShowDatePicker(v => !v)}
                            className={`p-1.5 rounded-lg transition-colors ${showDatePicker ? 'text-primary bg-primary/10' : 'text-gray-400 hover:text-gray-600 dark:hover:text-slate-300'}`}
                        >
                            <Calendar className="w-4 h-4" />
                        </button>
                        {newTaskTitle.trim() && (
                            <button
                                onClick={() => handleAddTask(addingChildOf ?? undefined)}
                                disabled={isAddingTask}
                                className="px-3 py-1 text-xs font-medium bg-primary text-white rounded-lg disabled:opacity-50"
                            >
                                {isAddingTask ? <Loader2 className="w-3 h-3 animate-spin" /> : '추가'}
                            </button>
                        )}
                    </div>
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
                        </div>
                    )}
                </div>
            </div>

            {/* Tree Task List */}
            <div
                className="flex-1 overflow-y-auto px-4 py-4"
                onDragOver={e => e.preventDefault()}
            >
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400 dark:text-slate-600">
                        <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                            <Plus className="w-7 h-7" />
                        </div>
                        <p className="text-sm font-medium">할 일이 없습니다</p>
                        <p className="text-xs">위에서 새 할 일을 추가해보세요</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-0">
                        {visibleTasks.map(task => (
                            <TreeTaskRow
                                key={task.id}
                                task={task}
                                depth={task.indent ?? 0}
                                childCount={getChildCount(task.id)}
                                completedChildCount={getCompletedChildCount(task.id)}
                                isCollapsed={collapsed.has(task.id)}
                                hasChildren={hasChildren(task.id)}
                                isDragging={draggedId === task.id}
                                isDragOver={dragOverId === task.id}
                                dropPosition={dragOverId === task.id ? dropPosition : null}
                                projectColor={project.color}
                                onToggle={handleToggle}
                                onDelete={handleDelete}
                                onEditSave={handleEditSave}
                                onCollapseToggle={handleCollapseToggle}
                                onAddChild={handleAddChild}
                                onDragStart={handleDragStart}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onDragEnd={handleDragEnd}
                                onIndentChange={handleIndentChange}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
