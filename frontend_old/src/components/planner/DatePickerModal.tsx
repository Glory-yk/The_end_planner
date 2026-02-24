import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Inbox, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { ko } from 'date-fns/locale';
import clsx from 'clsx';

interface DatePickerModalProps {
    isOpen: boolean;
    taskTitle: string;
    onClose: () => void;
    onSelectDate: (date: Date | null) => void; // null means Inbox
}

export const DatePickerModal = ({ isOpen, taskTitle, onClose, onSelectDate }: DatePickerModalProps) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Pad start with empty days to align with weekday
    const startDayOfWeek = monthStart.getDay(); // 0 = Sunday
    const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Make Monday = 0
    const paddedDays = [...Array(adjustedStartDay).fill(null), ...days];

    const handleAddToInbox = () => {
        onSelectDate(null);
    };

    const handleSelectDate = (date: Date) => {
        onSelectDate(date);
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
                        className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                <span className="font-medium text-gray-900 dark:text-white">날짜 선택</span>
                            </div>
                            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        {/* Task Title */}
                        <div className="px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700">
                            <p className="text-sm text-gray-600 dark:text-slate-300 truncate font-medium">{taskTitle}</p>
                        </div>

                        {/* Quick Action: Add to Inbox */}
                        <div className="p-4 border-b border-gray-100 dark:border-slate-700">
                            <button
                                onClick={handleAddToInbox}
                                className="w-full flex items-center gap-3 p-3 bg-gray-100 dark:bg-slate-700/50 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                            >
                                <div className="w-10 h-10 bg-gray-200 dark:bg-slate-600 rounded-xl flex items-center justify-center">
                                    <Inbox className="w-5 h-5 text-gray-600 dark:text-slate-300" />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-gray-900 dark:text-white">Inbox에 추가</p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400">날짜 미지정 (나중에 설정)</p>
                                </div>
                            </button>
                        </div>

                        {/* Calendar */}
                        <div className="p-4">
                            {/* Month Navigation */}
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-slate-300" />
                                </button>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {format(currentMonth, 'yyyy년 M월', { locale: ko })}
                                </span>
                                <button
                                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5 text-gray-600 dark:text-slate-300" />
                                </button>
                            </div>

                            {/* Weekday Headers */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {['월', '화', '수', '목', '금', '토', '일'].map(day => (
                                    <div key={day} className="text-center text-xs font-medium text-gray-400 dark:text-slate-500 py-1">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Days Grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {paddedDays.map((day, index) => {
                                    if (!day) {
                                        return <div key={`empty-${index}`} className="aspect-square" />;
                                    }

                                    const isCurrentMonth = isSameMonth(day, currentMonth);
                                    const isTodayDate = isToday(day);

                                    return (
                                        <button
                                            key={day.toISOString()}
                                            onClick={() => handleSelectDate(day)}
                                            className={clsx(
                                                "aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-colors",
                                                isTodayDate
                                                    ? "bg-primary text-white shadow-md"
                                                    : isCurrentMonth
                                                        ? "text-gray-900 dark:text-slate-200 hover:bg-primary/10 hover:text-primary dark:hover:bg-slate-700 dark:hover:text-primary"
                                                        : "text-gray-300 dark:text-slate-600"
                                            )}
                                        >
                                            {format(day, 'd')}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
