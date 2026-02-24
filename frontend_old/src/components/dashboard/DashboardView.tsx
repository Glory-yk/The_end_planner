import { useState, useMemo } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { motion } from 'framer-motion';
import { CheckCircle2, Target, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import clsx from 'clsx';

interface DashboardViewProps {
    onDateClick: (date: Date) => void;
}

export const DashboardView = ({ onDateClick }: DashboardViewProps) => {
    const { tasks, mandalartData, getSubGoalProgress } = useAppStore();

    // Monthly View State
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
    const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

    // Today's Stats
    const todayStats = useMemo(() => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const todayTasks = tasks.filter(t => t.scheduledDate === todayStr);
        const completed = todayTasks.filter(t => t.isCompleted).length;
        const total = todayTasks.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { completed, total, percentage };
    }, [tasks]);

    // Monthly Calendar Data
    const monthlyCalendar = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const days = eachDayOfInterval({ start: startDate, end: endDate });

        return days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            // Filter and Sort tasks by time
            const dayTasks = tasks
                .filter(t => t.scheduledDate === dateStr)
                .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

            const completed = dayTasks.filter(t => t.isCompleted).length;
            const total = dayTasks.length;

            return {
                date: day,
                isCurrentMonth: isSameMonth(day, currentMonth),
                isToday: isSameDay(day, new Date()),
                tasks: dayTasks,
                completed,
                total,
                hasTasks: total > 0,
                percentage: total > 0 ? (completed / total) * 100 : 0
            };
        });
    }, [currentMonth, tasks]);

    // Mandalart Stats (Core & Sub-Goals)
    const mandalartStats = useMemo(() => {
        const subGoals = [0, 1, 2, 3, 5, 6, 7, 8].map(index => ({
            title: mandalartData[index].title || `Goal ${index + 1}`,
            progress: getSubGoalProgress(index),
            color: mandalartData[index].title ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'
        }));

        const totalProgress = Math.round(subGoals.reduce((acc, curr) => acc + curr.progress, 0) / 8);
        return { subGoals, totalProgress };
    }, [mandalartData, getSubGoalProgress]);

    return (
        <div className="flex flex-col gap-6 p-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">나의 성장 기록을 한눈에 확인하세요</p>
            </div>

            {/* Today's Focus Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        Today's Focus
                    </h2>
                    <span className="text-2xl font-bold text-primary">{todayStats.percentage}%</span>
                </div>

                {/* Progress Bar */}
                <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${todayStats.percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-primary rounded-full"
                    />
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{todayStats.completed} 완료</span>
                    <span>총 {todayStats.total}개</span>
                </div>
            </div>

            {/* Monthly Overview (Calendar) */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-indigo-500" />
                        Monthly Overview
                    </h2>
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                            <ChevronLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[80px] text-center">
                            {format(currentMonth, 'MMMM yyyy')}
                        </span>
                        <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                            <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="w-full">
                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 mb-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                            <div key={i} className="text-center text-[10px] sm:text-xs font-bold text-gray-400 dark:text-slate-500">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days */}
                    <div className="grid grid-cols-7 gap-1">
                        {monthlyCalendar.map((day, i) => (
                            <button
                                key={i}
                                onClick={() => onDateClick(day.date)}
                                className={clsx(
                                    "min-h-[80px] rounded-lg flex flex-col items-start justify-start p-1.5 cursor-pointer transition-all relative overflow-hidden ring-1 ring-inset",
                                    !day.isCurrentMonth && "opacity-30 grayscale ring-transparent bg-gray-50/50 dark:bg-slate-800/50",
                                    day.isToday ? "ring-primary" : "ring-gray-100 dark:ring-slate-700 hover:ring-gray-300 dark:hover:ring-slate-500",
                                    !day.isToday && "bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-750"
                                )}
                            >
                                <span className={clsx(
                                    "text-xs font-medium mb-1",
                                    day.isToday ? "text-primary font-bold" : "text-gray-700 dark:text-gray-300"
                                )}>
                                    {format(day.date, 'd')}
                                </span>

                                {/* Tasks List */}
                                <div className="w-full flex-1 flex flex-col gap-1 overflow-hidden">
                                    {day.hasTasks && day.tasks.map((task) => (
                                        <div key={task.id} className="flex items-center gap-1 min-w-0">
                                            <div className={clsx(
                                                "w-1 h-1 rounded-full flex-shrink-0",
                                                task.isCompleted ? "bg-green-400" : "bg-primary"
                                            )} />
                                            <span className={clsx(
                                                "text-[9px] leading-tight truncate text-left",
                                                task.isCompleted ? "text-gray-400 line-through" : "text-gray-600 dark:text-gray-300"
                                            )}>
                                                {task.title}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mandalart Overview */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        Mandalart Goals
                    </h2>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total: {mandalartStats.totalProgress}%</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {mandalartStats.subGoals.map((goal, i) => (
                        <div key={i} className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-xl flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <span className={clsx("text-xs font-medium line-clamp-1", goal.color)}>
                                    {goal.title}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">
                                    {goal.progress}%
                                </span>
                            </div>
                            <div className="h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                                    style={{ width: `${goal.progress}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
