import { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { startOfWeek, addDays, format, isToday } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Task } from '@/types/task';
import { Plus, ChevronDown, ChevronUp, Inbox, Timer } from 'lucide-react';
import clsx from 'clsx';

interface WeeklyScheduleViewProps {
    selectedDate: Date;
    tasks: Task[];
    onToggle: (id: string) => void;
    onAddAtSlot: (date: Date, time: string) => void;
    activeTaskId?: string | null;
    elapsedMinutes?: number;
}

// 0시부터 23시까지 전체 시간
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const WeeklyScheduleView = ({ selectedDate, tasks, onToggle, onAddAtSlot, activeTaskId, elapsedMinutes = 0 }: WeeklyScheduleViewProps) => {
    const [showUnscheduled, setShowUnscheduled] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // 현재 시간으로 스크롤 (컴포넌트 마운트 시)
    useEffect(() => {
        if (scrollContainerRef.current) {
            const now = new Date();
            const currentHour = now.getHours();
            // 현재 시간 슬롯의 위치로 스크롤 (약간 위쪽으로)
            const scrollPosition = Math.max(0, (currentHour - 1) * 48); // 각 슬롯 높이 약 48px
            scrollContainerRef.current.scrollTop = scrollPosition;
        }
    }, []);

    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
    const weekDays = useMemo(() =>
        Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)),
        [weekStart]
    );

    // Get all tasks for the week
    const weekTasks = useMemo(() => {
        return tasks.filter(t => {
            if (!t.scheduledDate) return false;
            const taskDate = new Date(t.scheduledDate);
            return taskDate >= weekStart && taskDate < addDays(weekStart, 7);
        });
    }, [tasks, weekStart]);

    // Split into scheduled (with time) and unscheduled (no time)
    const scheduledTasks = weekTasks.filter(t => t.startTime);
    const unscheduledTasks = weekTasks.filter(t => !t.startTime);

    const getTasksForSlot = (date: Date, hour: number): Task[] => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return scheduledTasks.filter(task => {
            if (task.scheduledDate !== dateStr || !task.startTime) return false;
            const taskHour = parseInt(task.startTime.split(':')[0]);
            return taskHour === hour;
        });
    };

    const formatHour = (hour: number) => {
        if (hour === 0) return '12AM';
        if (hour < 12) return `${hour}AM`;
        if (hour === 12) return '12PM';
        return `${hour - 12}PM`;
    };

    return (
        <div className="flex flex-col h-[calc(100vh-200px)]">
            {/* Unscheduled Tasks Section */}
            {unscheduledTasks.length > 0 && (
                <div className="mx-4 mb-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl overflow-hidden flex-shrink-0">
                    <button
                        onClick={() => setShowUnscheduled(!showUnscheduled)}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Inbox className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                                시간 미지정 ({unscheduledTasks.length})
                            </span>
                        </div>
                        {showUnscheduled ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                    </button>

                    <AnimatePresence>
                        {showUnscheduled && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="px-3 pb-3"
                            >
                                <div className="flex flex-wrap gap-2">
                                    {unscheduledTasks.map(task => (
                                        <div
                                            key={task.id}
                                            className={clsx(
                                                "px-2 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors",
                                                task.isCompleted
                                                    ? "bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500 line-through"
                                                    : "bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                            )}
                                            onClick={() => onToggle(task.id)}
                                        >
                                            {task.title}
                                            {task.actualDuration !== undefined && task.actualDuration > 0 && (
                                                <span className="ml-1 text-green-600 dark:text-green-400">
                                                    ({task.actualDuration}분)
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Week Schedule Grid - Scrollable */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto overflow-x-auto no-scrollbar pb-32"
            >
                <div className="w-full px-1 min-w-[500px]">
                    {/* Header Row - Days */}
                    <div className="flex border-b border-gray-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-900 z-10">
                        {/* Time column placeholder */}
                        <div className="w-10 flex-shrink-0" />

                        {/* Day headers */}
                        {weekDays.map((date) => {
                            const isTodayDate = isToday(date);
                            return (
                                <div
                                    key={date.toISOString()}
                                    className={clsx(
                                        "flex-1 text-center py-2 border-l border-gray-100 dark:border-slate-700",
                                        isTodayDate && "bg-blue-50 dark:bg-blue-900/20"
                                    )}
                                >
                                    <div className={clsx(
                                        "text-xs font-medium",
                                        isTodayDate ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-slate-400"
                                    )}>
                                        {format(date, 'EEE', { locale: ko })}
                                    </div>
                                    <div className={clsx(
                                        "text-sm font-bold",
                                        isTodayDate ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-slate-100"
                                    )}>
                                        {format(date, 'd')}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Time Grid */}
                    {HOURS.map((hour) => (
                        <div key={hour} className="flex border-b border-gray-50 dark:border-slate-800">
                            {/* Hour label */}
                            <div className="w-10 flex-shrink-0 py-2 text-right pr-1">
                                <span className="text-[9px] font-medium text-gray-400 dark:text-slate-500">
                                    {formatHour(hour)}
                                </span>
                            </div>

                            {/* Day cells */}
                            {weekDays.map((date) => {
                                const slotTasks = getTasksForSlot(date, hour);
                                const isTodayDate = isToday(date);

                                return (
                                    <div
                                        key={`${date.toISOString()}-${hour}`}
                                        className={clsx(
                                            "flex-1 min-h-[48px] border-l border-gray-100 dark:border-slate-800 p-0.5 relative group",
                                            isTodayDate && "bg-blue-50/30 dark:bg-blue-900/10"
                                        )}
                                    >
                                        {/* Tasks in slot */}
                                        {slotTasks.map((task) => (
                                            <motion.div
                                                key={task.id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className={clsx(
                                                    "text-[10px] font-medium px-1.5 py-1 rounded mb-0.5 cursor-pointer transition-colors",
                                                    task.isCompleted
                                                        ? "bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 line-through"
                                                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                                                )}
                                                onClick={() => onToggle(task.id)}
                                                title={`${task.title}${task.actualDuration ? `\n실제: ${task.actualDuration}분` : ''}${task.startTime && task.actualDuration ? (() => {
                                                    const [h, m] = task.startTime?.split(':').map(Number) || [0, 0];
                                                    const totalMins = h * 60 + m + task.actualDuration;
                                                    const endH = Math.floor(totalMins / 60) % 24;
                                                    const endM = totalMins % 60;
                                                    const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
                                                    return `\n시간: ${task.startTime} - ${endTime}`;
                                                })() : ''}`}
                                            >
                                                <div className="truncate">{task.title}</div>
                                                {((task.actualDuration !== undefined && task.actualDuration > 0) || (task.id === activeTaskId)) && (
                                                    <div className="flex flex-col">
                                                        <div className={clsx(
                                                            "flex items-center gap-0.5 text-[8px]",
                                                            task.id === activeTaskId ? "text-red-500 animate-pulse font-bold" : "text-green-600 dark:text-green-400"
                                                        )}>
                                                            <Timer className="w-2 h-2" />
                                                            {(task.actualDuration || 0) + (task.id === activeTaskId ? elapsedMinutes : 0)}분
                                                        </div>
                                                        {task.startTime && (
                                                            <div className="text-[7px] text-gray-500 dark:text-gray-400">
                                                                {(() => {
                                                                    const [h, m] = task.startTime?.split(':').map(Number) || [0, 0];
                                                                    const currentTotal = (task.actualDuration || 0) + (task.id === activeTaskId ? elapsedMinutes : 0);
                                                                    const totalMins = h * 60 + m + currentTotal;
                                                                    const endH = Math.floor(totalMins / 60) % 24;
                                                                    const endM = totalMins % 60;
                                                                    const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
                                                                    return `${task.startTime}-${endTime}`;
                                                                })()}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}

                                        {/* Add button (shows on hover) */}
                                        {slotTasks.length === 0 && (
                                            <button
                                                onClick={() => onAddAtSlot(date, `${hour.toString().padStart(2, '0')}:00`)}
                                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                                            >
                                                <Plus className="w-3 h-3 text-gray-400 dark:text-slate-500" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
