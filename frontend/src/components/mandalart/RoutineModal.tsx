import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Repeat, Calendar, Clock } from 'lucide-react';
import { DayOfWeek, RecurrenceRule } from '@/types/task';
import clsx from 'clsx';

interface RoutineModalProps {
    isOpen: boolean;
    taskTitle: string;
    gridColor?: string;
    onClose: () => void;
    onConfirm: (recurrence: RecurrenceRule, startTime?: string) => void;
}

const DAYS_OF_WEEK: { value: DayOfWeek; label: string; short: string }[] = [
    { value: 0, label: '일요일', short: '일' },
    { value: 1, label: '월요일', short: '월' },
    { value: 2, label: '화요일', short: '화' },
    { value: 3, label: '수요일', short: '수' },
    { value: 4, label: '목요일', short: '목' },
    { value: 5, label: '금요일', short: '금' },
    { value: 6, label: '토요일', short: '토' },
];

export const RoutineModal = ({
    isOpen,
    taskTitle,
    gridColor = '#6b7280',
    onClose,
    onConfirm
}: RoutineModalProps) => {
    const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([1, 2, 3, 4, 5]); // 기본: 평일
    const [startTime, setStartTime] = useState<string>('09:00');
    const [hasTime, setHasTime] = useState(false);

    const handleToggleDay = (day: DayOfWeek) => {
        setSelectedDays(prev => {
            if (prev.includes(day)) {
                return prev.filter(d => d !== day);
            }
            return [...prev, day].sort((a, b) => a - b);
        });
    };

    const handleSelectWeekdays = () => {
        setSelectedDays([1, 2, 3, 4, 5]);
    };

    const handleSelectWeekend = () => {
        setSelectedDays([0, 6]);
    };

    const handleSelectAll = () => {
        setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
    };

    const handleConfirm = () => {
        if (selectedDays.length === 0) return;

        const recurrence: RecurrenceRule = {
            type: 'weekly',
            daysOfWeek: selectedDays,
            interval: 1
        };

        onConfirm(recurrence, hasTime ? startTime : undefined);
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
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl z-[60] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div
                            className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700"
                            style={{ backgroundColor: `${gridColor}15` }}
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: gridColor }}
                                >
                                    <Repeat className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">루틴 설정</h3>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate max-w-[200px]">
                                        {taskTitle}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* 요일 선택 */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">반복 요일</span>
                                </div>

                                {/* 빠른 선택 버튼 */}
                                <div className="flex gap-2 mb-3">
                                    <button
                                        onClick={handleSelectWeekdays}
                                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        평일
                                    </button>
                                    <button
                                        onClick={handleSelectWeekend}
                                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        주말
                                    </button>
                                    <button
                                        onClick={handleSelectAll}
                                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        매일
                                    </button>
                                </div>

                                {/* 요일 버튼들 */}
                                <div className="flex gap-1 justify-between">
                                    {DAYS_OF_WEEK.map(day => (
                                        <button
                                            key={day.value}
                                            onClick={() => handleToggleDay(day.value)}
                                            className={clsx(
                                                "w-10 h-10 rounded-full text-sm font-medium transition-all",
                                                selectedDays.includes(day.value)
                                                    ? "text-white shadow-md"
                                                    : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600"
                                            )}
                                            style={selectedDays.includes(day.value) ? { backgroundColor: gridColor } : {}}
                                        >
                                            {day.short}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 시간 설정 (선택사항) */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">시간 설정 (선택)</span>
                                    <label className="ml-auto flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={hasTime}
                                            onChange={(e) => setHasTime(e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                    </label>
                                </div>

                                {hasTime && (
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white"
                                    />
                                )}
                            </div>

                            {/* 미리보기 */}
                            {selectedDays.length > 0 && (
                                <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">루틴 요약</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        매주{' '}
                                        {selectedDays.map(d => DAYS_OF_WEEK.find(day => day.value === d)?.short).join(', ')}
                                        {hasTime && ` ${startTime}`}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex-shrink-0 flex justify-between p-4 border-t border-gray-100 dark:border-slate-700">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={selectedDays.length === 0}
                                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                                style={{ backgroundColor: selectedDays.length > 0 ? gridColor : undefined }}
                            >
                                <Repeat className="w-4 h-4" />
                                루틴 생성
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
