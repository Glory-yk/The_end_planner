'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, CheckCircle2, FolderOpen, Calendar } from 'lucide-react';
import { taskApi } from '@/api/taskApi';
import { Task } from '@/types/task';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function CompletedSearchModal({ isOpen, onClose }: Props) {
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

    // Debounced search on query change
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            search(query);
        }, 300);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, search]);

    // Focus input and load initial results on open
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            search('');
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen, search]);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="completed-modal-overlay"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="completed-modal">
                {/* Header */}
                <div className="completed-modal-header">
                    <div className="completed-modal-title">
                        <CheckCircle2 size={18} className="completed-modal-icon" />
                        <span>완료된 할 일 검색</span>
                    </div>
                    <button className="completed-modal-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                {/* Search Input */}
                <div className="completed-modal-search">
                    <Search size={16} className="completed-search-icon" />
                    <input
                        ref={inputRef}
                        type="text"
                        className="completed-search-input"
                        placeholder="제목 또는 설명으로 검색..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {query && (
                        <button className="completed-search-clear" onClick={() => setQuery('')}>
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Results */}
                <div className="completed-modal-results">
                    {loading ? (
                        <div className="completed-loading">
                            <div className="completed-spinner" />
                            <span>검색 중...</span>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="completed-empty">
                            {query ? `"${query}"에 대한 결과 없음` : '완료된 할 일이 없습니다'}
                        </div>
                    ) : (
                        <>
                            <div className="completed-count">
                                {query ? `${results.length}개 결과` : `최근 ${results.length}개`}
                            </div>
                            <ul className="completed-list">
                                {results.map((task) => (
                                    <li key={task.id} className="completed-item">
                                        <CheckCircle2 size={15} className="completed-item-check" />
                                        <div className="completed-item-content">
                                            <span className="completed-item-title">{task.title}</span>
                                            {task.description && (
                                                <span className="completed-item-desc">{task.description}</span>
                                            )}
                                            <div className="completed-item-meta">
                                                {(task as any).project?.name && (
                                                    <span className="completed-item-project">
                                                        <FolderOpen size={11} />
                                                        {(task as any).project.name}
                                                    </span>
                                                )}
                                                {task.scheduledDate && (
                                                    <span className="completed-item-date">
                                                        <Calendar size={11} />
                                                        {task.scheduledDate}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
