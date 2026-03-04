'use client';

import { useState, useRef } from 'react';
import { Send, X, Calendar, Flag, Bell, Target, MoreHorizontal, ChevronDown, BarChart2 } from 'lucide-react';
import clsx from 'clsx';
import { useProjects } from '@/contexts/ProjectsContext';

interface AddTaskInputProps {
    onAdd: (
        title: string,
        time?: string,
        projectId?: string,
        extra?: { description?: string; deadline?: string; category?: string }
    ) => void;
    defaultProjectId?: string;
}

const CATEGORIES = [
    { label: 'personal', color: '#a855f7' },
    { label: 'work', color: '#3b82f6' },
    { label: 'study', color: '#22c55e' },
    { label: 'exercise', color: '#f97316' },
    { label: 'social', color: '#ec4899' },
];

export const AddTaskInput = ({ onAdd, defaultProjectId }: AddTaskInputProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(defaultProjectId);
    const [showProjectMenu, setShowProjectMenu] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('personal');
    const [showCategoryMenu, setShowCategoryMenu] = useState(false);
    const [deadline, setDeadline] = useState<string>('');
    const [scheduledDate, setScheduledDate] = useState<string>('');
    const { projects } = useProjects();
    const titleRef = useRef<HTMLInputElement>(null);

    const selectedProject = projects.find(p => p.id === selectedProjectId);
    const categoryColor = CATEGORIES.find(c => c.label === selectedCategory)?.color ?? '#a855f7';

    const handleSubmit = () => {
        if (!title.trim()) return;

        // Parse time hashtag (e.g., #14:00, #9:00)
        const timeRegex = /#(\d{1,2})(?::(\d{2}))?/;
        const match = title.match(timeRegex);
        let finalTitle = title;
        let timeStr: string | undefined;

        if (match) {
            const [fullMatch, hour, minute] = match;
            const h = parseInt(hour);
            const m = minute ? parseInt(minute) : 0;
            if (h >= 0 && h < 24 && m >= 0 && m < 60) {
                timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                finalTitle = title.replace(fullMatch, '').trim().replace(/\s+/, ' ');
            }
        }

        onAdd(finalTitle, timeStr, selectedProjectId, {
            description: description.trim() || undefined,
            deadline: deadline || undefined,
            category: selectedCategory,
        });
        setTitle('');
        setDescription('');
        setDeadline('');
        setScheduledDate('');
        setIsExpanded(false);
        setShowProjectMenu(false);
        setShowCategoryMenu(false);
    };

    const handleCancel = () => {
        setTitle('');
        setDescription('');
        setDeadline('');
        setScheduledDate('');
        setIsExpanded(false);
        setShowProjectMenu(false);
        setShowCategoryMenu(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
        if (e.key === 'Escape') {
            handleCancel();
        }
    };

    if (!isExpanded) {
        return (
            <div className="px-6 mb-4">
                <button
                    onClick={() => { setIsExpanded(true); setTimeout(() => titleRef.current?.focus(), 50); }}
                    className="w-full text-left px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 ring-1 ring-gray-100 dark:ring-slate-700 text-gray-400 dark:text-slate-500 text-sm hover:ring-primary/30 transition-all shadow-sm"
                >
                    + 할 일 추가
                </button>
            </div>
        );
    }

    return (
        <div className="px-6 mb-4">
            <div className="rounded-2xl bg-white dark:bg-[#1e1e2e] ring-1 ring-primary/30 shadow-lg overflow-visible">

                {/* Title + voice icon */}
                <div className="flex items-center px-4 pt-4 pb-1 gap-2">
                    <input
                        ref={titleRef}
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="작업 이름"
                        className="flex-1 bg-transparent outline-none text-base font-medium text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-slate-600"
                    />
                    <BarChart2 className="w-5 h-5 text-gray-300 dark:text-slate-600 flex-shrink-0" />
                </div>

                {/* Description */}
                <div className="px-4 pb-3">
                    <input
                        type="text"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="설명"
                        className="w-full bg-transparent outline-none text-sm text-gray-400 dark:text-slate-500 placeholder:text-gray-300 dark:placeholder:text-slate-600"
                    />
                </div>

                {/* Chip buttons */}
                <div className="flex items-center gap-2 px-4 py-2 border-t border-gray-100 dark:border-slate-700/60 flex-wrap">
                    {/* Date chip */}
                    <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 transition-colors cursor-pointer">
                        <Calendar className="w-3.5 h-3.5" />
                        {scheduledDate ? scheduledDate : '날짜'}
                        <input
                            type="date"
                            className="hidden"
                            value={scheduledDate}
                            onChange={e => setScheduledDate(e.target.value)}
                        />
                    </label>

                    {/* Priority chip (visual only) */}
                    <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 transition-colors">
                        <Flag className="w-3.5 h-3.5" />
                        우선 순위
                    </button>

                    {/* Reminder chip (visual only) */}
                    <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 transition-colors">
                        <Bell className="w-3.5 h-3.5" />
                        미리 알림
                    </button>

                    {/* Deadline chip */}
                    <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 transition-colors cursor-pointer">
                        <Target className="w-3.5 h-3.5" />
                        {deadline ? deadline : '마감일'}
                        <input
                            type="date"
                            className="hidden"
                            value={deadline}
                            onChange={e => setDeadline(e.target.value)}
                        />
                    </label>

                    {/* More chip */}
                    <button className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 transition-colors">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Bottom bar: category + project + cancel + send */}
                <div className="flex items-center px-3 py-2 border-t border-gray-100 dark:border-slate-700/60 gap-2">

                    {/* Category selector */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => { setShowCategoryMenu(!showCategoryMenu); setShowProjectMenu(false); }}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-slate-700"
                            style={{ color: categoryColor }}
                        >
                            <span className="text-sm font-bold">#</span>
                            <span>{selectedCategory}</span>
                            <ChevronDown className="w-3 h-3 opacity-60" />
                        </button>

                        {showCategoryMenu && (
                            <div className="absolute left-0 bottom-full mb-1 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 z-50 py-1">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.label}
                                        onClick={() => { setSelectedCategory(cat.label); setShowCategoryMenu(false); }}
                                        className={clsx(
                                            'w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2',
                                            selectedCategory === cat.label ? 'font-semibold' : 'text-gray-700 dark:text-slate-300'
                                        )}
                                        style={selectedCategory === cat.label ? { color: cat.color } : {}}
                                    >
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Project selector */}
                    {projects.length > 0 && (
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => { setShowProjectMenu(!showProjectMenu); setShowCategoryMenu(false); }}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                {selectedProject && (
                                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: selectedProject.color || '#9ca3af' }} />
                                )}
                                <span>{selectedProject?.name || 'Inbox'}</span>
                                <ChevronDown className="w-3 h-3 opacity-60" />
                            </button>

                            {showProjectMenu && (
                                <div className="absolute left-0 bottom-full mb-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 z-50 py-1 max-h-48 overflow-y-auto">
                                    <button
                                        onClick={() => { setSelectedProjectId(undefined); setShowProjectMenu(false); }}
                                        className={clsx(
                                            'w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors',
                                            !selectedProjectId ? 'text-primary font-medium' : 'text-gray-700 dark:text-slate-300'
                                        )}
                                    >
                                        # Inbox
                                    </button>
                                    {projects.map(project => (
                                        <button
                                            key={project.id}
                                            onClick={() => { setSelectedProjectId(project.id); setShowProjectMenu(false); }}
                                            className={clsx(
                                                'w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2',
                                                selectedProjectId === project.id ? 'text-primary font-medium' : 'text-gray-700 dark:text-slate-300'
                                            )}
                                        >
                                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: project.color || '#9ca3af' }} />
                                            {project.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex-1" />

                    {/* Cancel button */}
                    <button
                        onClick={handleCancel}
                        className="p-2 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Send button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!title.trim()}
                        className={clsx(
                            'p-2 rounded-xl transition-all',
                            title.trim()
                                ? 'bg-red-500 hover:bg-red-600 text-white shadow-md'
                                : 'bg-gray-100 dark:bg-slate-700 text-gray-300 dark:text-slate-600'
                        )}
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
