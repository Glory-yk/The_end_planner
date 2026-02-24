import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { startOfWeek, addDays, format, isSameDay, isToday } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Task } from '@/types/task';
import { Plus, Check } from 'lucide-react';
import clsx from 'clsx';

interface WeeklyViewProps {
    selectedDate: Date;
    tasks: Task[];
    onSelectDay: (date: Date) => void;
    onAddTask?: (date: Date) => void;
}

export const WeeklyView = ({ selectedDate, tasks, onSelectDay, onAddTask }: WeeklyViewProps) => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
    const weekDays = useMemo(() =>
        Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)),
        [weekStart]
    );

    const getTasksForDay = (date: Date): Task[] => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return tasks.filter(t => t.scheduledDate === dateStr);
    };

    return (
        <div className="px-4 pb-32">
            {/* Week Header */}
            <div className="text-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                    {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
                </h2>
            </div>

            {/* Week Grid */}
            <div className="grid grid-cols-1 gap-3">
                {weekDays.map((date, index) => {
                    const dayTasks = getTasksForDay(date);
                    const completedCount = dayTasks.filter(t => t.isCompleted).length;
                    const totalCount = dayTasks.length;
                    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                    const isCurrentDay = isToday(date);
                    const isSelected = isSameDay(date, selectedDate);

                    return (
                        <motion.div
                            key={date.toISOString()}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => onSelectDay(date)}
                            className={clsx(
                                "relative p-4 rounded-2xl cursor-pointer transition-all border-2",
                                isCurrentDay ? "border-blue-500 bg-blue-50" :
                                    isSelected ? "border-gray-900 bg-gray-50" :
                                        "border-gray-100 bg-white hover:border-gray-300 hover:shadow-md"
                            )}
                        >
                            {/* Day Header */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={clsx(
                                        "w-10 h-10 rounded-xl flex flex-col items-center justify-center",
                                        isCurrentDay ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"
                                    )}>
                                        <span className="text-[10px] font-medium uppercase leading-none">
                                            {format(date, 'EEE', { locale: ko })}
                                        </span>
                                        <span className="text-lg font-bold leading-none">
                                            {format(date, 'd')}
                                        </span>
                                    </div>

                                    {totalCount > 0 && (
                                        <div className="flex items-center gap-2">
                                            <span className={clsx(
                                                "text-sm font-medium",
                                                completedCount === totalCount ? "text-green-600" : "text-gray-600"
                                            )}>
                                                {completedCount}/{totalCount}
                                            </span>
                                            {completedCount === totalCount && totalCount > 0 && (
                                                <Check className="w-4 h-4 text-green-500" />
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Quick Add Button */}
                                {onAddTask && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAddTask(date);
                                        }}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Progress Bar */}
                            {totalCount > 0 && (
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercent}%` }}
                                        className={clsx(
                                            "h-full rounded-full",
                                            completedCount === totalCount ? "bg-green-500" : "bg-blue-500"
                                        )}
                                    />
                                </div>
                            )}

                            {/* Task Preview */}
                            <div className="space-y-1.5">
                                {dayTasks.slice(0, 3).map((task) => (
                                    <div
                                        key={task.id}
                                        className={clsx(
                                            "text-sm truncate px-2 py-1 rounded-lg",
                                            task.isCompleted
                                                ? "text-gray-400 line-through bg-gray-50"
                                                : "text-gray-700 bg-gray-100"
                                        )}
                                    >
                                        {task.startTime && (
                                            <span className="text-xs text-gray-400 mr-1">{task.startTime}</span>
                                        )}
                                        {task.title}
                                    </div>
                                ))}

                                {dayTasks.length > 3 && (
                                    <div className="text-xs text-gray-400 px-2">
                                        +{dayTasks.length - 3} more
                                    </div>
                                )}

                                {dayTasks.length === 0 && (
                                    <div className="text-sm text-gray-300 italic px-2">
                                        No tasks
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
