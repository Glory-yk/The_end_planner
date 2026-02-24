import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Timer } from 'lucide-react';

interface QuickAddModalProps {
    isOpen: boolean;
    time: string;
    duration?: number; // in minutes
    onClose: () => void;
    onAdd: (title: string, time?: string, duration?: number) => void;
}

const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}분`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours}시간`;
    return `${hours}시간 ${mins}분`;
};

export const QuickAddModal = ({ isOpen, time, duration, onClose, onAdd }: QuickAddModalProps) => {
    const [title, setTitle] = useState('');
    const [selectedTime, setSelectedTime] = useState(time);

    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setSelectedTime(time);
        }
    }, [isOpen, time]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        onAdd(title, selectedTime, duration);
        onClose();
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
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-xl z-50 p-4 sm:p-6 border border-gray-100 dark:border-slate-700 flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-700/50 px-2 py-1 rounded-lg">
                                    <Clock className="w-4 h-4" />
                                    <input
                                        type="time"
                                        value={selectedTime}
                                        onChange={(e) => setSelectedTime(e.target.value)}
                                        step="300"
                                        className="bg-transparent outline-none cursor-pointer font-sans"
                                    />
                                </div>
                                {duration && (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium">
                                        <Timer className="w-3 h-3" />
                                        <span>{formatDuration(duration)}</span>
                                    </div>
                                )}
                            </div>
                            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full dark:text-slate-400">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <input
                                autoFocus
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="What needs to be done?"
                                className="w-full text-lg font-medium outline-none placeholder:text-gray-300 dark:placeholder:text-slate-600 mb-6 bg-transparent text-gray-900 dark:text-white"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!title.trim()}
                                    className="px-4 py-2 text-sm font-medium bg-black dark:bg-primary text-white rounded-lg hover:opacity-90 dark:hover:bg-primary/90 disabled:opacity-50"
                                >
                                    Add Task
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
