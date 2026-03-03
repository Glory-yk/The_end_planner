'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, CheckCircle2, FolderOpen, Calendar, ClipboardCheck } from 'lucide-react';
import { taskApi } from '@/api/taskApi';
import { Task } from '@/types/task';

export function CompletedTasksView() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const search = useCallback(async (q: string) => {
        setLoading(true);
        try {
            const data = await taskApi.searchCompleted(q);
            setResults(data);
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => search(query), 300);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [query, search]);

    // Load on mount
    useEffect(() => { search(''); }, [search]);

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        try {
            return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
        } catch { return dateStr; }
    };

    return (
        <div className="flex flex-col h-full pb-4">
            {/* Header */}
            <div className="px-6 pt-6 pb-4">
                <div className="flex items-center gap-3 mb-1">
                    <ClipboardCheck className="w-6 h-6 text-green-500" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">완료된 할일</h1>
                </div>
                <p className="text-sm text-gray-400 dark:text-slate-500">
                    {loading ? '불러오는 중...' : `${results.length}개의 완료된 할일`}
                </p>
            </div>

            {/* Search bar */}
            <div className="px-6 mb-4">
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 ring-1 ring-gray-100 dark:ring-slate-700 shadow-sm">
                    <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="제목 또는 설명으로 검색..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="p-0.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto px-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-gray-400 dark:text-slate-500">검색 중...</span>
                    </div>
                ) : results.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                        <ClipboardCheck className="w-12 h-12 text-gray-200 dark:text-slate-700" />
                        <p className="text-gray-400 dark:text-slate-500 text-sm">
                            {query ? `"${query}"에 대한 결과가 없습니다` : '완료된 할일이 없습니다'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {query && (
                            <p className="text-xs text-gray-400 dark:text-slate-500 mb-3">{results.length}개 결과</p>
                        )}
                        {results.map((task) => (
                            <div
                                key={task.id}
                                className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white dark:bg-slate-800 ring-1 ring-gray-100 dark:ring-slate-700 hover:ring-gray-200 dark:hover:ring-slate-600 transition-all"
                            >
                                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400 line-through truncate">
                                        {task.title}
                                    </p>
                                    {task.description && (
                                        <p className="text-xs text-gray-400 dark:text-slate-500 truncate mt-0.5">
                                            {task.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                        {(task as any).project?.name && (
                                            <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
                                                <FolderOpen className="w-3 h-3" />
                                                {(task as any).project.name}
                                            </span>
                                        )}
                                        {task.scheduledDate && (
                                            <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(task.scheduledDate)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
