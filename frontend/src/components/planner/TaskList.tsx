import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, Trash2, CalendarClock, Play, Timer } from 'lucide-react';
import clsx from 'clsx';
import { Task } from '@/types/task';
import { DEFAULT_CATEGORIES } from '@/types/mandalart';
import { TimePickerModal } from './TimePickerModal';
import { useAppStore } from '@/hooks/useAppStore';

interface TaskListProps {
    tasks: Task[];
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onUpdateTime?: (id: string, time: string | undefined) => void;
    onStartTimer?: (taskId: string, taskTitle: string) => void;
    activeTimerTaskId?: string | null;
}

export const TaskList = ({ tasks, onToggle, onDelete, onUpdateTime, onStartTimer, activeTimerTaskId }: TaskListProps) => {
    const [timePickerTask, setTimePickerTask] = useState<Task | null>(null);
    const { mandalartData } = useAppStore();

    const getCategoryColor = (gridIndex: number): string => {
        const category = DEFAULT_CATEGORIES.find(c => c.gridIndex === gridIndex);
        // Use the explicit colors we defined in MandalartView if possible, 
        // but DEFAULT_CATEGORIES might need updating or we use the array directly.
        // For now, reuse the existing logic or the array from MandalartView if accessible.
        // Let's assume DEFAULT_CATEGORIES has the correct mapping or fallback.
        // To be safe and consistent with MandalartView, let's redefine the colors locally or use a shared constant.
        // Since we don't have the shared constant exported easily right now, I'll use the same hex codes.
        const GRID_COLORS = [
            '#ef4444', '#f97316', '#eab308', '#22c55e',
            'var(--color-primary)', // Center
            '#06b6d4', '#3b82f6', '#a855f7', '#ec4899'
        ];
        return GRID_COLORS[gridIndex] || category?.color || '#6b7280';
    };

    const handleTimeConfirm = (time: string) => {
        if (timePickerTask && onUpdateTime) {
            onUpdateTime(timePickerTask.id, time);
        }
        setTimePickerTask(null);
    };

    const handleTimeClear = () => {
        if (timePickerTask && onUpdateTime) {
            onUpdateTime(timePickerTask.id, undefined);
        }
        setTimePickerTask(null);
    };

    return (
        <>
            <div className="px-6 space-y-3 pb-24">
                <AnimatePresence initial={false}>
                    {tasks.map((task) => {
                        const hasMandalartLink = !!task.mandalartRef;
                        const gridIndex = task.mandalartRef?.gridIndex;
                        const linkColor = (hasMandalartLink && gridIndex !== undefined)
                            ? getCategoryColor(gridIndex)
                            : undefined;

                        const subGoalTitle = (hasMandalartLink && gridIndex !== undefined)
                            ? (mandalartData[gridIndex]?.title || `Goal ${gridIndex + 1}`)
                            : null;

                        const hasTime = !!task.startTime;
                        const isTimerActive = activeTimerTaskId === task.id;

                        return (
                            <motion.div
                                key={task.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20, height: 0 }}
                                className={clsx(
                                    "group flex items-center gap-3 p-4 rounded-2xl mb-3 transition-all border relative overflow-hidden",
                                    // Base Colors
                                    "bg-white dark:bg-slate-800",
                                    // Border: Default if no linkColor
                                    !linkColor && "border-gray-100 dark:border-slate-700",
                                    "shadow-sm hover:shadow-md dark:shadow-slate-900/50",
                                    task.isCompleted && "opacity-60 bg-gray-50 dark:bg-slate-700/50"
                                )}
                                // Apply border color based on theme
                                style={linkColor ? { borderColor: `${linkColor}66` } : {}}
                            >
                                {/* Tint Overlay for Linked Tasks */}
                                {linkColor && (
                                    <div
                                        className="absolute inset-0 pointer-events-none opacity-10 dark:opacity-20 transition-opacity"
                                        style={{ backgroundColor: linkColor }}
                                    />
                                )}

                                <button
                                    onClick={() => onToggle(task.id)}
                                    className={clsx(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 z-10",
                                        // Default styles for unlinked tasks
                                        !linkColor && (task.isCompleted
                                            ? "bg-primary border-primary text-white"
                                            : "border-gray-300 hover:border-primary dark:border-slate-500 dark:hover:border-primary"),
                                        // Linked tasks will override via style
                                        linkColor && "text-white"
                                    )}
                                    style={linkColor ? {
                                        borderColor: linkColor,
                                        backgroundColor: task.isCompleted ? linkColor : 'transparent'
                                    } : {}}
                                >
                                    {task.isCompleted && <Check className="w-3.5 h-3.5 fill-current" strokeWidth={3} />}
                                </button>

                                <div className="flex-1 min-w-0 z-10">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className={clsx(
                                            "text-base font-medium truncate transition-all",
                                            task.isCompleted
                                                ? "text-gray-400 line-through dark:text-slate-500"
                                                : "text-gray-900 dark:text-slate-100"
                                        )}>
                                            {task.title}
                                        </h3>

                                        {/* Sub Goal Title Badge */}
                                        {subGoalTitle && linkColor && (
                                            <span
                                                className="flex items-center px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm tracking-wide"
                                                style={{ backgroundColor: linkColor }}
                                            >
                                                {subGoalTitle}
                                            </span>
                                        )}
                                    </div>

                                    {(task.startTime || task.duration || task.actualDuration) && (
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            {task.startTime && (
                                                <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded">
                                                    <Clock className="w-3 h-3" />
                                                    {task.startTime}
                                                </span>
                                            )}
                                            {task.duration && (
                                                <span className="text-xs text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded">
                                                    예정 {task.duration}분
                                                </span>
                                            )}
                                            {task.actualDuration !== undefined && task.actualDuration > 0 && (
                                                <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded font-medium">
                                                    <Timer className="w-3 h-3" />
                                                    실제 {task.actualDuration}분
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Actions Group */}
                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
                                    {/* Timer Start Button - only show if not completed and no active timer on this task */}
                                    {onStartTimer && !task.isCompleted && !isTimerActive && (
                                        <button
                                            type="button"
                                            onClick={() => onStartTimer(task.id, task.title)}
                                            className="p-2 rounded-lg transition-colors text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                            title="타이머 시작"
                                        >
                                            <Play className="w-4 h-4 fill-current" />
                                        </button>
                                    )}

                                    {/* Timer Active Indicator */}
                                    {isTimerActive && (
                                        <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium animate-pulse">
                                            <Timer className="w-3 h-3" />
                                            진행중
                                        </span>
                                    )}

                                    {onUpdateTime && (
                                        <button
                                            type="button"
                                            onClick={() => setTimePickerTask(task)}
                                            className={clsx(
                                                "p-2 rounded-lg transition-colors",
                                                hasTime
                                                    ? "text-primary bg-primary/10 hover:bg-primary/20"
                                                    : "text-gray-400 hover:text-primary hover:bg-primary/10 dark:text-slate-400 dark:hover:text-white"
                                            )}
                                            title="Set Time"
                                        >
                                            <CalendarClock className="w-4 h-4" />
                                        </button>
                                    )}

                                    <button
                                        onClick={() => onDelete(task.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Time Picker Modal */}
            <TimePickerModal
                isOpen={!!timePickerTask}
                taskTitle={timePickerTask?.title || ''}
                currentTime={timePickerTask?.startTime}
                onClose={() => setTimePickerTask(null)}
                onConfirm={handleTimeConfirm}
                onClear={handleTimeClear}
            />
        </>
    );
};
