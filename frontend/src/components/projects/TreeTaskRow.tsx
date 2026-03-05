'use client';

import { useState, useRef } from 'react';
import {
    Circle, CheckCircle2, Trash2,
    Edit3, Check, X, CalendarDays, ChevronDown,
    ChevronRight, GripVertical, Plus
} from 'lucide-react';
import { Task } from '@/types/task';

export interface TreeTaskRowProps {
    task: Task;
    depth: number;           // 0 = root, 1 = child, 2 = grandchild…
    childCount: number;
    completedChildCount: number;
    isCollapsed: boolean;
    hasChildren: boolean;
    isDragging: boolean;     // 이 태스크가 드래그 중인지
    isDragOver: boolean;     // 이 태스크 위에 드롭될 예정인지
    dropPosition: 'before' | 'after' | 'child' | null;
    projectColor?: string | null;  // 프로젝트 대표 색상

    onToggle: (task: Task) => void;
    onDelete: (id: string) => void;
    onEditSave: (id: string, title: string) => void;
    onCollapseToggle: (id: string) => void;
    onAddChild: (parentId: string) => void;

    // DnD handlers
    onDragStart: (e: React.DragEvent, id: string) => void;
    onDragOver: (e: React.DragEvent, id: string, depth: number) => void;
    onDrop: (e: React.DragEvent, id: string) => void;
    onDragEnd: () => void;

    // Indent change
    onIndentChange: (id: string, newIndent: number) => void;
}

export const TreeTaskRow = ({
    task, depth, childCount, completedChildCount,
    isCollapsed, hasChildren, isDragging, isDragOver, dropPosition,
    projectColor,
    onToggle, onDelete, onEditSave, onCollapseToggle, onAddChild,
    onDragStart, onDragOver, onDrop, onDragEnd, onIndentChange,
}: TreeTaskRowProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [isHovered, setIsHovered] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        if (editTitle.trim()) {
            onEditSave(task.id, editTitle.trim());
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setEditTitle(task.title);
            setIsEditing(false);
        } else if (e.key === 'Tab') {
            e.preventDefault();
            if (e.shiftKey) {
                // Unindent
                if (depth > 0) onIndentChange(task.id, depth - 1);
            } else {
                // Indent deeper (max 3)
                if (depth < 3) onIndentChange(task.id, depth + 1);
            }
        }
    };

    const startEditing = () => {
        setEditTitle(task.title);
        setIsEditing(true);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    // Indent: 20px per level
    const indentPx = depth * 20;

    // Drop indicator line style
    const showTopLine = isDragOver && dropPosition === 'before';
    const showBottomLine = isDragOver && dropPosition === 'after';
    const showChildHighlight = isDragOver && dropPosition === 'child';

    const progressPct = childCount > 0 ? Math.round((completedChildCount / childCount) * 100) : 0;

    return (
        <div
            className={`relative transition-all duration-150 ${isDragging ? 'opacity-40' : 'opacity-100'}`}
            style={{ paddingLeft: `${indentPx}px` }}
        >
            {/* Drop indicator: before */}
            {showTopLine && (
                <div className="absolute left-0 right-0 top-0 h-0.5 bg-blue-400 rounded-full z-10 pointer-events-none" />
            )}

            <div
                className={`group flex items-center gap-2 px-2 py-2 rounded-xl transition-colors cursor-default
                    ${isHovered ? 'bg-gray-50 dark:bg-slate-900/80' : ''}
                    ${showChildHighlight ? 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-300 dark:ring-blue-700' : ''}
                `}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onDragOver={e => onDragOver(e, task.id, depth)}
                onDrop={e => onDrop(e, task.id)}
            >
                {/* Drag handle */}
                <div
                    className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-300 dark:text-slate-700 hover:text-gray-400 dark:hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    draggable
                    onDragStart={e => onDragStart(e, task.id)}
                    onDragEnd={onDragEnd}
                >
                    <GripVertical className="w-3.5 h-3.5" />
                </div>

                {/* Collapse toggle */}
                <button
                    className={`flex-shrink-0 w-4 h-4 flex items-center justify-center transition-colors
                        ${hasChildren ? 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300' : 'invisible'}`}
                    onClick={() => hasChildren && onCollapseToggle(task.id)}
                    tabIndex={-1}
                >
                    {hasChildren && (
                        isCollapsed
                            ? <ChevronRight className="w-3.5 h-3.5" />
                            : <ChevronDown className="w-3.5 h-3.5" />
                    )}
                </button>

                {/* Circle checkbox — 프로젝트 컬러 적용 */}
                <button
                    onClick={() => onToggle(task)}
                    className="flex-shrink-0 transition-colors"
                    style={{ color: projectColor || '#ef4444' }}
                >
                    {task.isCompleted ? (
                        <CheckCircle2 style={{ width: 18, height: 18 }} />
                    ) : (
                        <Circle style={{ width: 18, height: 18 }} />
                    )}
                </button>

                {/* Task content */}
                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        <input
                            ref={inputRef}
                            autoFocus
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleSave}
                            className="w-full text-sm bg-transparent border-b border-primary/60 outline-none text-gray-900 dark:text-white pb-0.5"
                        />
                    ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                            <span
                                onDoubleClick={startEditing}
                                className={`text-sm leading-snug ${task.isCompleted
                                    ? 'line-through text-gray-400 dark:text-slate-600'
                                    : 'text-gray-800 dark:text-slate-200'}`}
                            >
                                {task.title}
                            </span>

                            {/* Progress badge (e.g. 2/5) */}
                            {childCount > 0 && (
                                <span className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-0.5">
                                    <span className="font-medium text-gray-500 dark:text-slate-400">{completedChildCount}/{childCount}</span>
                                    {/* Mini progress bar */}
                                    <span className="w-12 h-1 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden ml-1">
                                        <span
                                            className="block h-full bg-red-400 rounded-full transition-all"
                                            style={{ width: `${progressPct}%` }}
                                        />
                                    </span>
                                </span>
                            )}

                            {/* Date badge */}
                            {task.scheduledDate && !task.isCompleted && (
                                <span className="flex items-center gap-0.5 text-xs text-red-400">
                                    <CalendarDays className="w-3 h-3" />
                                    {task.scheduledDate}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Action buttons */}
                {!isEditing && (
                    <div className={`flex items-center gap-0.5 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                        <button
                            onClick={() => onAddChild(task.id)}
                            title="하위 할 일 추가"
                            className="p-1 text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={startEditing}
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

                {isEditing && (
                    <div className="flex gap-0.5">
                        <button onClick={handleSave} className="p-1 text-primary hover:bg-primary/10 rounded">
                            <Check className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { setEditTitle(task.title); setIsEditing(false); }} className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Drop indicator: after */}
            {showBottomLine && (
                <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-blue-400 rounded-full z-10 pointer-events-none" />
            )}
        </div>
    );
};
