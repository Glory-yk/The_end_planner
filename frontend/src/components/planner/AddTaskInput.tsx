'use client';

import { useState, useRef } from 'react';
import { Send, X, Calendar, Flag, Bell, Target, MoreHorizontal, ChevronDown, BarChart2 } from 'lucide-react';
import clsx from 'clsx';
import { useProjects } from '@/contexts/ProjectsContext';

interface AddTaskInputProps {
    onAdd: (title: string, time?: string, projectId?: string) => void;
    defaultProjectId?: string;
}

export const AddTaskInput = ({ onAdd, defaultProjectId }: AddTaskInputProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(defaultProjectId);
    const [showProjectMenu, setShowProjectMenu] = useState(false);
    const { projects } = useProjects();
    const titleRef = useRef<HTMLInputElement>(null);

    const selectedProject = projects.find(p => p.id === selectedProjectId);

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

        onAdd(finalTitle, timeStr, selectedProjectId);
        setTitle('');
        setDescription('');
        setIsExpanded(false);
        setShowProjectMenu(false);
    };

    const handleCancel = () => {
        setTitle('');
        setDescription('');
        setIsExpanded(false);
        setShowProjectMenu(false);
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
            <div className="rounded-2xl bg-white dark:bg-slate-800 ring-1 ring-primary/30 shadow-lg overflow-hidden">
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
                <div className="flex items-center gap-2 px-4 py-2 border-t border-gray-100 dark:border-slate-700 flex-wrap">
                    <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 transition-colors">
                        <Calendar className="w-3.5 h-3.5" />
                        날짜
                    </button>
                    <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 transition-colors">
                        <Flag className="w-3.5 h-3.5" />
                        우선 순위
                    </button>
                    <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 transition-colors">
                        <Bell className="w-3.5 h-3.5" />
                        미리 알림
                    </button>
                    <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 transition-colors">
                        <Target className="w-3.5 h-3.5" />
                        마감일
                    </button>
                    <button className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 transition-colors">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Bottom bar: project selector + cancel + send */}
                <div className="flex items-center px-3 py-2 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 gap-2">
                    {/* Project selector */}
                    <div className="relative flex-1">
                        <button
                            type="button"
                            onClick={() => setShowProjectMenu(!showProjectMenu)}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                        >
                            <span className="text-primary text-sm font-bold">#</span>
                            <span>{selectedProject?.name || 'personal'}</span>
                            <ChevronDown className="w-3 h-3 opacity-60" />
                        </button>

                        {showProjectMenu && (
                            <div className="absolute left-0 bottom-full mb-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 z-50 py-1 max-h-48 overflow-y-auto">
                                <button
                                    onClick={() => { setSelectedProjectId(undefined); setShowProjectMenu(false); }}
                                    className={clsx(
                                        "w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors",
                                        !selectedProjectId ? "text-primary font-medium" : "text-gray-700 dark:text-slate-300"
                                    )}
                                >
                                    # Inbox
                                </button>
                                {projects.map(project => (
                                    <button
                                        key={project.id}
                                        onClick={() => { setSelectedProjectId(project.id); setShowProjectMenu(false); }}
                                        className={clsx(
                                            "w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2",
                                            selectedProjectId === project.id ? "text-primary font-medium" : "text-gray-700 dark:text-slate-300"
                                        )}
                                    >
                                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: project.color || '#9ca3af' }} />
                                        {project.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

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
                            "p-2 rounded-xl transition-all",
                            title.trim()
                                ? "bg-red-500 hover:bg-red-600 text-white shadow-md"
                                : "bg-gray-100 dark:bg-slate-700 text-gray-300 dark:text-slate-600"
                        )}
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
