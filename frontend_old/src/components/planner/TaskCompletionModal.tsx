import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock } from 'lucide-react';
import { Task } from '@/types/task';

interface TaskCompletionModalProps {
    isOpen: boolean;
    task: Task | undefined;
    elapsedMinutes: number;
    onClose: () => void;
    onComplete: () => void;
    onSaveOnly: () => void;
}

export const TaskCompletionModal = ({
    isOpen,
    task,
    elapsedMinutes,
    onClose,
    onComplete,
    onSaveOnly,
}: TaskCompletionModalProps) => {
    if (!isOpen || !task) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <React.Fragment>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden"
                        >
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    Have you completed this task?
                                </h3>

                                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 mb-6">
                                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">
                                        Task
                                    </p>
                                    <p className="text-gray-900 dark:text-slate-200 font-medium mb-3">
                                        {task.title}
                                    </p>

                                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                                        <Clock className="w-4 h-4" />
                                        <span>Focus time: <span className="font-bold text-primary">{elapsedMinutes} min</span></span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={onComplete}
                                        className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-primary/30"
                                    >
                                        Yes, Complete Task
                                    </button>

                                    <button
                                        onClick={onSaveOnly}
                                        className="w-full py-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600 rounded-xl font-medium transition-colors"
                                    >
                                        No, Just Save Time
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </React.Fragment>
            )}
        </AnimatePresence>
    );
};
