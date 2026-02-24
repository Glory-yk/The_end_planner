import { useState, useMemo } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday
} from 'date-fns';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Task } from '@/types/task';
import clsx from 'clsx';


interface MonthlyCalendarProps {
    currentDate: Date;
    tasks: Task[];
    onDateSelect: (date: Date) => void;
    onMonthChange: (date: Date) => void;
}

export const MonthlyCalendar = ({
    currentDate,
    tasks,
    onDateSelect,
    onMonthChange
}: MonthlyCalendarProps) => {
    const [monthDate, setMonthDate] = useState(currentDate);

    // Update internal state when prop changes
    // This allows the parent to control the date but also local navigation
    useMemo(() => {
        setMonthDate(currentDate);
    }, [currentDate]);

    const handlePrevMonth = () => {
        const newDate = subMonths(monthDate, 1);
        setMonthDate(newDate);
        onMonthChange(newDate);
    };

    const handleNextMonth = () => {
        const newDate = addMonths(monthDate, 1);
        setMonthDate(newDate);
        onMonthChange(newDate);
    };

    const handleToday = () => {
        const newDate = new Date();
        setMonthDate(newDate);
        onMonthChange(newDate);
    };

    // Calculate calendar grid
    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        return eachDayOfInterval({ start: startDate, end: endDate });
    }, [monthDate]);

    // Tasks grouped by date
    const tasksByDate = useMemo(() => {
        const map: Record<string, Task[]> = {};
        tasks.forEach(task => {
            if (task.scheduledDate) {
                if (!map[task.scheduledDate]) {
                    map[task.scheduledDate] = [];
                }
                map[task.scheduledDate].push(task);
            }
        });
        return map;
    }, [tasks]);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {format(monthDate, 'yyyy년 M월')}
                </h2>

                <div className="flex items-center gap-1 bg-gray-50 dark:bg-slate-800 rounded-xl p-1">
                    <button
                        onClick={handlePrevMonth}
                        className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-gray-500 dark:text-gray-400 transition-all shadow-sm"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleToday}
                        className="px-3 py-1.5 text-sm font-medium hover:bg-white dark:hover:bg-slate-700 rounded-lg text-gray-600 dark:text-gray-300 transition-all shadow-sm"
                    >
                        오늘
                    </button>
                    <button
                        onClick={handleNextMonth}
                        className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-gray-500 dark:text-gray-400 transition-all shadow-sm"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 mb-4">
                {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                    <div
                        key={day}
                        className={clsx(
                            "text-center text-sm font-medium py-2",
                            i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-400 dark:text-gray-500"
                        )}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-y-4 gap-x-2">
                {calendarDays.map((day) => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const dayTasks = tasksByDate[dateKey] || [];
                    const isCurrentMonth = isSameMonth(day, monthDate);
                    const isSelected = isSameDay(day, currentDate);
                    const isTodayDate = isToday(day);

                    return (
                        <motion.button
                            key={day.toISOString()}
                            onClick={() => onDateSelect(day)}
                            layout
                            className={clsx(
                                "relative flex flex-col items-center p-2 rounded-2xl transition-all h-[100px]",
                                !isCurrentMonth && "opacity-30 grayscale",
                                isSelected ? "bg-primary/5 dark:bg-primary/20 ring-2 ring-primary ring-inset" : "hover:bg-gray-50 dark:hover:bg-slate-800"
                            )}
                        >
                            <span
                                className={clsx(
                                    "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1",
                                    isTodayDate
                                        ? "bg-primary text-white"
                                        : isSelected
                                            ? "text-primary dark:text-primary-foreground font-bold"
                                            : "text-gray-700 dark:text-gray-300"
                                )}
                            >
                                {format(day, 'd')}
                            </span>

                            {/* Task Indicators */}
                            <div className="w-full flex flex-col gap-1 overflow-hidden px-1">
                                {dayTasks.slice(0, 3).map((task) => (
                                    <div
                                        key={task.id}
                                        className={clsx(
                                            "text-[10px] px-1.5 py-0.5 rounded-full truncate",
                                            task.isCompleted
                                                ? "bg-gray-100 text-gray-400 line-through dark:bg-slate-800"
                                                : "bg-primary/10 text-primary dark:bg-primary/20"
                                        )}
                                    >
                                        {task.title}
                                    </div>
                                ))}
                                {dayTasks.length > 3 && (
                                    <div className="text-[10px] text-center text-gray-400">
                                        +{dayTasks.length - 3}
                                    </div>
                                )}
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};
