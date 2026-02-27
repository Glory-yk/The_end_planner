import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Play, Clock, X, AlarmClockOff } from 'lucide-react';
import { Task } from '@/types/task';
import { useEffect, useState } from 'react';

interface ScheduleAlertModalProps {
    isOpen: boolean;
    task: Task | null;
    onClose: () => void;
    onStartTimer: () => void;
    onSnooze: () => void;
}

export const ScheduleAlertModal = ({
    isOpen,
    task,
    onClose,
    onStartTimer,
    onSnooze
}: ScheduleAlertModalProps) => {
    const [countdown, setCountdown] = useState(30);

    // Auto-dismiss after 30 seconds
    useEffect(() => {
        if (!isOpen) {
            setCountdown(30);
            return;
        }

        const intervalId = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    onClose();
                    return 30;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, [isOpen, onClose]);

    // Play alert sound when modal opens
    useEffect(() => {
        if (isOpen) {
            const audio = new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
            audio.volume = 0.5;
            audio.play().catch(() => { });
        }
    }, [isOpen]);

    if (!task) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-x-4 top-1/3 -translate-y-1/2 z-50 max-w-sm mx-auto"
                    >
                        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-slate-700">
                            {/* Header with animation */}
                            <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white relative overflow-hidden">
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full animate-pulse" />
                                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full" />

                                <div className="relative flex items-center gap-3">
                                    <div className="p-3 bg-white/20 rounded-2xl animate-bounce">
                                        <Bell className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">예정된 일정</h2>
                                        <p className="text-sm text-white/80">시작할 시간이에요!</p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {/* Task Info */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                        {task.title}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-slate-400">
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" />
                                            {task.startTime}
                                        </span>
                                        {task.duration && (
                                            <span>
                                                예정 {task.duration}분
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    <button
                                        onClick={onStartTimer}
                                        className="w-full py-4 px-6 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
                                    >
                                        <Play className="w-5 h-5 fill-current" />
                                        타이머 시작
                                    </button>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={onSnooze}
                                            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <AlarmClockOff className="w-4 h-4" />
                                            5분 후 알림
                                        </button>

                                        <button
                                            onClick={onClose}
                                            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                            무시
                                        </button>
                                    </div>
                                </div>

                                {/* Auto-dismiss countdown */}
                                <div className="mt-4 text-center">
                                    <span className="text-xs text-gray-400 dark:text-slate-500">
                                        {countdown}초 후 자동으로 닫힙니다
                                    </span>
                                    <div className="mt-2 h-1 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-primary"
                                            initial={{ width: '100%' }}
                                            animate={{ width: '0%' }}
                                            transition={{ duration: 30, ease: 'linear' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
