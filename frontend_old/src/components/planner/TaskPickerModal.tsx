import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Plus, ListTodo } from 'lucide-react';
import { Task } from '@/types/task';
import clsx from 'clsx';

interface TaskPickerModalProps {
    isOpen: boolean;
    time: string;
    unscheduledTasks: Task[];
    onClose: () => void;
    onSelectTask: (taskId: string) => void;
    onCreateNew: () => void;
}

export const TaskPickerModal = ({
    isOpen,
    time,
    unscheduledTasks,
    onClose,
    onSelectTask,
    onCreateNew
}: TaskPickerModalProps) => {
    const formatTime = (t: string) => {
        const hour = parseInt(t.split(':')[0]);
        const suffix = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:00 ${suffix}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden border border-gray-100 dark:border-slate-700 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <span className="font-medium text-gray-900 dark:text-white">{formatTime(time)}</span>
                            </div>
                            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full">
                                <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 max-h-[50vh] overflow-y-auto">
                            {/* Create New Task Option */}
                            <button
                                onClick={onCreateNew}
                                className="w-full flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-colors mb-3"
                            >
                                <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-xl flex items-center justify-center">
                                    <Plus className="w-5 h-5 text-white" />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-blue-700 dark:text-blue-300">새 할 일 만들기</p>
                                    <p className="text-xs text-blue-500 dark:text-blue-400">{formatTime(time)}에 새 항목 추가</p>
                                </div>
                            </button>

                            {/* Unscheduled Tasks */}
                            {unscheduledTasks.length > 0 && (
                                <>
                                    <div className="flex items-center gap-2 mb-2 mt-4">
                                        <ListTodo className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                                        <span className="text-sm font-medium text-gray-500 dark:text-slate-400">
                                            미지정 할 일 ({unscheduledTasks.length})
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {unscheduledTasks.map((task) => (
                                            <button
                                                key={task.id}
                                                onClick={() => onSelectTask(task.id)}
                                                className={clsx(
                                                    "w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left",
                                                    "bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
                                                )}
                                            >
                                                <div className="w-8 h-8 bg-gray-200 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                                                    <Clock className="w-4 h-4 text-gray-500 dark:text-slate-300" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                                                    <p className="text-xs text-gray-400 dark:text-slate-400">클릭하여 {formatTime(time)}에 배치</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}

                            {unscheduledTasks.length === 0 && (
                                <div className="text-center py-4 text-gray-400 dark:text-slate-500 text-sm">
                                    미지정 할 일이 없습니다
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
