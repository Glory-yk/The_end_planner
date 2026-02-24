import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Clock } from 'lucide-react';
import { Task } from '@/types/task';
import clsx from 'clsx';
import { format } from 'date-fns';

interface SessionAssignModalProps {
    isOpen: boolean;
    elapsedMinutes: number;
    tasks: Task[];
    onClose: () => void;
    onAssign: (taskId: string) => void;
    onCreate: (title: string, scheduledDate?: string) => void;
    onDiscard: () => void;
}

export const SessionAssignModal = ({
    isOpen,
    elapsedMinutes,
    tasks,
    onClose,
    onAssign,
    onCreate,
    onDiscard
}: SessionAssignModalProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'existing' | 'new'>('existing');
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const todayStr = format(new Date(), 'yyyy-MM-dd');

    // Filter tasks: uncompleted today's tasks or inbox tasks
    const relevantTasks = useMemo(() => {
        return tasks.filter(t => {
            const isMatch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
            const isRelevantDate = !t.scheduledDate || t.scheduledDate === todayStr;
            const isNotCompleted = !t.isCompleted;
            return isMatch && isRelevantDate && isNotCompleted;
        }).sort((a, b) => {
            // Sort by: Scheduled today -> Inbox -> Others
            if (a.scheduledDate === todayStr && b.scheduledDate !== todayStr) return -1;
            if (a.scheduledDate !== todayStr && b.scheduledDate === todayStr) return 1;
            return 0;
        });
    }, [tasks, searchQuery, todayStr]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden relative z-10"
                >
                    <div className="p-6">
                        <div className="text-center mb-6">
                            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
                                <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                {elapsedMinutes}분 집중하셨네요!
                            </h2>
                            <p className="text-gray-500 dark:text-slate-400 text-sm">
                                이 시간을 어디에 기록할까요?
                            </p>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl mb-4">
                            <button
                                onClick={() => setActiveTab('existing')}
                                className={clsx(
                                    "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                                    activeTab === 'existing'
                                        ? "bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white"
                                        : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
                                )}
                            >
                                기존 할 일에 추가
                            </button>
                            <button
                                onClick={() => setActiveTab('new')}
                                className={clsx(
                                    "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                                    activeTab === 'new'
                                        ? "bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white"
                                        : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
                                )}
                            >
                                새 할 일로 기록
                            </button>
                        </div>

                        {activeTab === 'existing' ? (
                            <div className="space-y-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="할 일 검색..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
                                        autoFocus
                                    />
                                </div>

                                <div className="h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                    {relevantTasks.length > 0 ? (
                                        relevantTasks.map(task => (
                                            <button
                                                key={task.id}
                                                onClick={() => onAssign(task.id)}
                                                className="w-full text-left p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-blue-100 dark:hover:border-blue-900 group"
                                            >
                                                <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {task.title}
                                                </div>
                                                <div className="text-xs text-gray-400 flex items-center justify-between mt-1">
                                                    <span>{task.scheduledDate || 'Inbox'}</span>
                                                    {task.actualDuration ? (
                                                        <span>누적 {task.actualDuration}분</span>
                                                    ) : null}
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-400 text-sm">
                                            검색 결과가 없습니다
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                        할 일 제목
                                    </label>
                                    <input
                                        type="text"
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                        placeholder="무엇을 했나요?"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20"
                                        autoFocus
                                    />
                                </div>
                                <button
                                    disabled={!newTaskTitle.trim()}
                                    onClick={() => onCreate(newTaskTitle, todayStr)}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    새 할 일 생성 및 시간 기록
                                </button>
                            </div>
                        )}

                        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 flex justify-center">
                            <button
                                onClick={onDiscard}
                                className="text-gray-400 hover:text-red-500 text-sm transition-colors"
                            >
                                기록하지 않고 닫기
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
