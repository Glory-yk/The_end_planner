import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Clock, GripVertical, Move, Check, ListPlus } from 'lucide-react';
import { Task } from '@/types/task';
import clsx from 'clsx';

interface TimeSlotsProps {
    tasks: Task[];
    onToggle: (id: string) => void;
    onAddAtTime: (time: string) => void;
    onAssignTime?: (taskId: string, time: string) => void;
    onDragSelect?: (startTime: string, endTime: string, duration: number) => void;
    onOpenTaskPicker?: (time: string) => void;
    activeTaskId?: string | null;
    elapsedMinutes?: number;
}

// 0시부터 23시까지 전체 시간
const HOURS = Array.from({ length: 24 }, (_, i) => i);

// Task Action Popup Component
interface TaskActionPopupProps {
    task: Task;
    position: { x: number; y: number };
    onComplete: () => void;
    onAddNew: () => void;
    onUpdateTime: (time: string) => void;
    onClose: () => void;
}

const TaskActionPopup = ({ task, position, onComplete, onAddNew, onUpdateTime, onClose }: TaskActionPopupProps) => {
    const [isEditingTime, setIsEditingTime] = useState(false);
    const [selectedHour, setSelectedHour] = useState(() => {
        if (task.startTime) return parseInt(task.startTime.split(':')[0]);
        return 0;
    });
    const [selectedMinute, setSelectedMinute] = useState(() => {
        if (task.startTime) return parseInt(task.startTime.split(':')[1]);
        return 0;
    });

    // 5분 단위 분 배열
    const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            // 팝업 내부 클릭은 무시
            if ((e.target as HTMLElement).closest('.task-action-popup')) return;
            onClose();
        };
        setTimeout(() => document.addEventListener('click', handleClickOutside), 0);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [onClose]);

    const handleTimeSave = () => {
        const timeStr = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
        onUpdateTime(timeStr);
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="task-action-popup fixed z-50 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden w-48"
            style={{ left: position.x, top: position.y, transform: 'translate(-50%, -100%)' }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="p-2 border-b border-gray-100 dark:border-slate-700">
                <p className="text-xs font-medium text-gray-500 dark:text-slate-400 truncate">
                    {task.title}
                </p>
            </div>

            <div className="p-1">
                {isEditingTime ? (
                    <div className="p-2 space-y-2">
                        <div className="flex gap-1 items-center justify-center">
                            <select
                                value={selectedHour}
                                onChange={(e) => setSelectedHour(Number(e.target.value))}
                                className="bg-gray-50 dark:bg-slate-700 rounded p-1 text-sm border border-gray-200 dark:border-slate-600 outline-none"
                            >
                                {HOURS.map(h => (
                                    <option key={h} value={h}>{h.toString().padStart(2, '0')}시</option>
                                ))}
                            </select>
                            <span className="text-gray-400">:</span>
                            <select
                                value={selectedMinute}
                                onChange={(e) => setSelectedMinute(Number(e.target.value))}
                                className="bg-gray-50 dark:bg-slate-700 rounded p-1 text-sm border border-gray-200 dark:border-slate-600 outline-none"
                            >
                                {minutes.map(m => (
                                    <option key={m} value={m}>{m.toString().padStart(2, '0')}분</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={() => setIsEditingTime(false)}
                                className="flex-1 py-1 text-xs text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleTimeSave}
                                className="flex-1 py-1 text-xs bg-primary text-white hover:bg-primary/90 rounded"
                            >
                                저장
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <button
                            onClick={() => setIsEditingTime(true)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                        >
                            <Clock className="w-4 h-4 text-gray-400" />
                            시간 변경
                        </button>
                        <button
                            onClick={() => onComplete()}
                            className={clsx(
                                "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                                task.isCompleted
                                    ? "text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                                    : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                            )}
                        >
                            <Check className="w-4 h-4" />
                            {task.isCompleted ? '완료 해제' : '완료 처리'}
                        </button>
                        <button
                            onClick={() => onAddNew()}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                            <ListPlus className="w-4 h-4" />
                            추가하기
                        </button>
                    </>
                )}
            </div>
        </motion.div>
    );
};

export const TimeSlots = ({
    tasks,
    onToggle,
    onAddAtTime,
    onAssignTime,
    onDragSelect,
    onOpenTaskPicker,
    activeTaskId,
    elapsedMinutes = 0
}: TimeSlotsProps) => {
    // Separate scheduled and unscheduled tasks
    const scheduledTasks = tasks.filter(t => t.startTime);
    const unscheduledTasks = tasks.filter(t => !t.startTime);

    // Drag selection state (for creating new tasks)
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartHour, setDragStartHour] = useState<number | null>(null);
    const [dragEndHour, setDragEndHour] = useState<number | null>(null);

    // Drag & Drop state (for moving tasks)
    const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
    const [dropTargetHour, setDropTargetHour] = useState<number | null>(null);
    const dragRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Task action popup state
    const [actionPopup, setActionPopup] = useState<{
        task: Task;
        hour: number;
        position: { x: number; y: number };
    } | null>(null);

    // 현재 시간으로 스크롤 (컴포넌트 마운트 시)
    useEffect(() => {
        if (scrollContainerRef.current) {
            const now = new Date();
            const currentHour = now.getHours();
            // 현재 시간 슬롯의 위치로 스크롤 (약간 위쪽으로)
            const scrollPosition = Math.max(0, (currentHour - 1) * 80); // 각 슬롯 높이 약 80px
            scrollContainerRef.current.scrollTop = scrollPosition;
        }
    }, []);

    const getTasksForHour = (hour: number) => {
        return scheduledTasks.filter(task => {
            if (!task.startTime) return false;
            const taskHour = parseInt(task.startTime.split(':')[0]);
            return taskHour === hour;
        });
    };

    // Time range drag handlers
    const handleDragStart = useCallback((hour: number) => {
        if (draggingTaskId) return;
        setIsDragging(true);
        setDragStartHour(hour);
        setDragEndHour(hour);
    }, [draggingTaskId]);

    const handleDragMove = useCallback((hour: number) => {
        if (isDragging && dragStartHour !== null) {
            setDragEndHour(hour);
        }
    }, [isDragging, dragStartHour]);

    const handleDragEnd = useCallback(() => {
        if (isDragging && dragStartHour !== null && dragEndHour !== null) {
            const startHour = Math.min(dragStartHour, dragEndHour);
            const endHour = Math.max(dragStartHour, dragEndHour) + 1;
            const duration = (endHour - startHour) * 60;

            const startTime = `${startHour.toString().padStart(2, '0')}:00`;
            const endTime = `${endHour.toString().padStart(2, '0')}:00`;

            if (onDragSelect) {
                onDragSelect(startTime, endTime, duration);
            } else {
                onAddAtTime(startTime);
            }
        }

        setIsDragging(false);
        setDragStartHour(null);
        setDragEndHour(null);
    }, [isDragging, dragStartHour, dragEndHour, onDragSelect, onAddAtTime]);

    // Task drag & drop handlers
    const handleTaskDragStart = (taskId: string) => {
        setDraggingTaskId(taskId);
    };

    const handleTaskDragEnd = () => {
        if (draggingTaskId && dropTargetHour !== null && onAssignTime) {
            const timeString = `${dropTargetHour.toString().padStart(2, '0')}:00`;
            onAssignTime(draggingTaskId, timeString);
        }
        setDraggingTaskId(null);
        setDropTargetHour(null);
    };

    const handleSlotDragOver = (hour: number) => {
        if (draggingTaskId) {
            setDropTargetHour(hour);
        }
    };

    const isHourInSelection = (hour: number): boolean => {
        if (!isDragging || dragStartHour === null || dragEndHour === null) return false;
        const minHour = Math.min(dragStartHour, dragEndHour);
        const maxHour = Math.max(dragStartHour, dragEndHour);
        return hour >= minHour && hour <= maxHour;
    };

    const getSelectionDuration = (): string => {
        if (dragStartHour === null || dragEndHour === null) return '';
        const hours = Math.abs(dragEndHour - dragStartHour) + 1;
        if (hours === 1) return '1시간';
        return `${hours}시간`;
    };

    const handleSlotClick = (hour: number) => {
        const timeString = `${hour.toString().padStart(2, '0')}:00`;

        if (unscheduledTasks.length > 0 && onOpenTaskPicker) {
            onOpenTaskPicker(timeString);
        } else {
            onAddAtTime(timeString);
        }
    };

    // Task 클릭 시 액션 팝업 표시
    const handleTaskClick = (e: React.MouseEvent, task: Task, hour: number) => {
        e.stopPropagation();
        e.preventDefault();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setActionPopup({
            task,
            hour,
            position: { x: rect.left + rect.width / 2, y: rect.top - 10 }
        });
    };

    const handlePopupComplete = () => {
        if (actionPopup) {
            onToggle(actionPopup.task.id);
            setActionPopup(null);
        }
    };

    const handlePopupAddNew = () => {
        if (actionPopup) {
            const timeString = `${actionPopup.hour.toString().padStart(2, '0')}:00`;
            if (unscheduledTasks.length > 0 && onOpenTaskPicker) {
                onOpenTaskPicker(timeString);
            } else {
                onAddAtTime(timeString);
            }
            setActionPopup(null);
        }
    };

    const handlePopupUpdateTime = (time: string) => {
        if (actionPopup && onAssignTime) {
            onAssignTime(actionPopup.task.id, time);
            setActionPopup(null);
        }
    };

    // Current time state
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();

    return (
        <div
            className="select-none flex flex-col h-[calc(100vh-280px)]"
            ref={dragRef}
        >
            {/* ... (Drag instruction and Unscheduled Tasks remain same) */}

            {/* Drag instruction hint */}
            <div className="px-6 flex items-center gap-2 text-xs text-gray-400 mb-2 flex-shrink-0">
                <GripVertical className="w-3 h-3" />
                <span>드래그하여 시간 범위 선택 | 할 일을 드래그하여 시간 배치</span>
            </div>

            {/* Unscheduled Tasks Section */}
            {unscheduledTasks.length > 0 && (
                <div className="mx-6 mb-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                        <span className="text-sm font-medium text-gray-500 dark:text-slate-400">시간 미지정 ({unscheduledTasks.length})</span>
                        <Move className="w-3 h-3 text-gray-300 dark:text-slate-600 ml-auto" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {unscheduledTasks.map((task) => (
                            <div
                                key={task.id}
                                className={clsx(
                                    "px-3 py-2 rounded-xl text-sm font-medium cursor-grab active:cursor-grabbing transition-all",
                                    "bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 border-2 border-dashed border-gray-300 dark:border-slate-600",
                                    draggingTaskId === task.id && "border-primary bg-primary/10 opacity-50 scale-105"
                                )}
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('taskId', task.id);
                                    e.dataTransfer.effectAllowed = 'move';
                                    handleTaskDragStart(task.id);
                                }}
                                onDrag={(e) => {
                                    // Auto-scroll when dragging near edges
                                    if (!scrollContainerRef.current || e.clientY === 0) return;
                                    const container = scrollContainerRef.current;
                                    const rect = container.getBoundingClientRect();
                                    const threshold = 100; // pixels from edge to trigger scroll
                                    const scrollSpeed = 10;

                                    if (e.clientY > rect.bottom - threshold) {
                                        container.scrollTop += scrollSpeed;
                                    }
                                    else if (e.clientY < rect.top + threshold && e.clientY > rect.top) {
                                        container.scrollTop -= scrollSpeed;
                                    }
                                }}
                                onDragEnd={handleTaskDragEnd}
                                title="드래그하여 시간대에 배치하세요"
                            >
                                {task.title}
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">💡 아래 시간대로 드래그하거나, 시간대를 클릭하세요</p>
                </div>
            )}

            {/* Selection Duration Preview */}
            {isDragging && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed top-20 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg z-50 text-sm font-medium"
                >
                    {getSelectionDuration()} 선택됨
                </motion.div>
            )}

            {/* Dragging Task Indicator */}
            {draggingTaskId && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg z-50 text-sm font-medium"
                >
                    시간대에 놓으세요
                </motion.div>
            )}

            {/* Task Action Popup */}
            <AnimatePresence>
                {actionPopup && (
                    <TaskActionPopup
                        task={actionPopup.task}
                        position={actionPopup.position}
                        onComplete={handlePopupComplete}
                        onAddNew={handlePopupAddNew}
                        onUpdateTime={handlePopupUpdateTime}
                        onClose={() => setActionPopup(null)}
                    />
                )}
            </AnimatePresence>

            {/* Scrollable Time Slots Container */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto px-6 pb-32 space-y-1 relative" // added relative
                onMouseUp={() => {
                    handleDragEnd();
                    handleTaskDragEnd();
                }}
                onMouseLeave={() => {
                    if (isDragging) handleDragEnd();
                    if (draggingTaskId) handleTaskDragEnd();
                }}
                onTouchEnd={() => {
                    handleDragEnd();
                    handleTaskDragEnd();
                }}
            >
                {/* Time Slots */}
                {HOURS.map((hour) => {
                    const hourTasks = getTasksForHour(hour);
                    const timeLabel = `${hour > 12 ? hour - 12 : hour} ${hour >= 12 ? 'PM' : 'AM'}`;
                    const isSelected = isHourInSelection(hour);
                    const isDropTarget = dropTargetHour === hour && draggingTaskId;
                    const isCurrentHour = hour === currentHour;

                    return (
                        <div
                            key={hour}
                            className={clsx(
                                "flex gap-4 group transition-colors rounded-lg",
                                "relative",
                                isSelected && "bg-blue-100 dark:bg-blue-900/20",
                                isDropTarget && "bg-green-100 dark:bg-green-900/20 ring-2 ring-green-400 dark:ring-green-600"
                            )}
                            onMouseDown={() => handleDragStart(hour)}
                            onMouseEnter={() => {
                                handleDragMove(hour);
                                handleSlotDragOver(hour);
                            }}
                            onDragOver={(e) => {
                                e.preventDefault();
                                handleSlotDragOver(hour);
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                const taskId = e.dataTransfer.getData('taskId');
                                if (taskId && onAssignTime) {
                                    const timeString = `${hour.toString().padStart(2, '0')}:00`;
                                    onAssignTime(taskId, timeString);
                                }
                                setDraggingTaskId(null);
                                setDropTargetHour(null);
                            }}
                        >
                            <div className="w-16 pt-2 text-xs font-medium text-gray-400 text-right">
                                {timeLabel}
                            </div>

                            <div
                                className={clsx(
                                    "flex-1 min-h-[4rem] border-t border-gray-100 dark:border-slate-800 relative",
                                    isSelected && "bg-primary/5 dark:bg-primary/10 border-primary/20",
                                    isDropTarget && "border-green-300 dark:border-green-600"
                                )}
                                data-hour={hour}
                            >
                                {/* Current Time Indicator */}
                                {isCurrentHour && (
                                    <div
                                        className="absolute w-full flex items-center z-10 pointer-events-none"
                                        style={{ top: `${(currentMinute / 60) * 100}%` }}
                                    >
                                        <div className="w-2 h-2 rounded-full bg-blue-500 -ml-1"></div>
                                        <div className="h-[2px] bg-blue-500 w-full opacity-50"></div>
                                    </div>
                                )}

                                {hourTasks.length > 0 ? (
                                    <div className="space-y-2 py-2">
                                        {hourTasks.map((task) => (
                                            <div
                                                key={task.id}
                                                draggable
                                                onDragStart={(e: any) => {
                                                    // 드래그 시작 시 팝업 닫기
                                                    if (actionPopup) setActionPopup(null);

                                                    e.dataTransfer.setData('taskId', task.id);
                                                    e.dataTransfer.effectAllowed = 'move';
                                                    handleTaskDragStart(task.id);
                                                }}
                                                onDragEnd={handleTaskDragEnd}
                                                className={clsx(
                                                    "p-3 rounded-xl border text-sm font-medium transition-colors cursor-grab active:cursor-grabbing relative",
                                                    task.isCompleted
                                                        ? "bg-gray-50 border-gray-200 text-gray-400 line-through dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500"
                                                        : "bg-primary/5 border-primary/20 text-primary dark:bg-primary/20 dark:text-primary-300",
                                                    actionPopup?.task.id === task.id && "ring-2 ring-primary"
                                                )}
                                                onClick={(e) => handleTaskClick(e, task, hour)}
                                                onMouseDown={(e) => e.stopPropagation()}
                                                onMouseEnter={(e) => e.stopPropagation()}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2 pointer-events-none">
                                                        {/* Completion indicator */}
                                                        <div className={clsx(
                                                            "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                                                            task.isCompleted
                                                                ? "bg-green-500 border-green-500"
                                                                : "border-gray-300 dark:border-slate-500"
                                                        )}>
                                                            {task.isCompleted && <Check className="w-2.5 h-2.5 text-white" />}
                                                        </div>
                                                        <span>{task.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 pointer-events-none">
                                                        {task.duration && (
                                                            <span className="text-xs text-primary/70">예정 {task.duration}분</span>
                                                        )}
                                                        {((task.actualDuration !== undefined && task.actualDuration > 0) || (task.id === activeTaskId)) && task.startTime && (
                                                            <div className="flex flex-col items-end">
                                                                <span className={clsx(
                                                                    "text-xs font-medium",
                                                                    task.id === activeTaskId ? "text-red-500 animate-pulse" : "text-green-600 dark:text-green-400"
                                                                )}>
                                                                    {task.id === activeTaskId ? (
                                                                        <>진행 {(task.actualDuration || 0) + elapsedMinutes}분</>
                                                                    ) : (
                                                                        <>실제 {task.actualDuration}분</>
                                                                    )}
                                                                </span>
                                                                <span className="text-[10px] text-gray-400 dark:text-slate-500">
                                                                    {(() => {
                                                                        const [h, m] = task.startTime?.split(':').map(Number) || [0, 0];
                                                                        const currentTotal = (task.actualDuration || 0) + (task.id === activeTaskId ? elapsedMinutes : 0);
                                                                        const totalMins = h * 60 + m + currentTotal;
                                                                        const endH = Math.floor(totalMins / 60) % 24;
                                                                        const endM = totalMins % 60;
                                                                        const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
                                                                        return `${task.startTime} - ${endTime}`;
                                                                    })()}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    !isDragging && !draggingTaskId && (
                                        <button
                                            onClick={() => handleSlotClick(hour)}
                                            className="w-full h-full absolute inset-0 opacity-0 group-hover:opacity-100 hover:bg-gray-50 transition-all rounded-lg flex items-center justify-center"
                                        >
                                            {unscheduledTasks.length > 0 ? (
                                                <span className="text-xs text-blue-500">+ 할 일 선택/추가</span>
                                            ) : (
                                                <Plus className="w-4 h-4 text-gray-400" />
                                            )}
                                        </button>
                                    )
                                )}

                                {/* Selection indicator */}
                                {isSelected && hourTasks.length === 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-full h-1 bg-blue-400 rounded-full mx-2" />
                                    </div>
                                )}

                                {/* Drop target indicator */}
                                {isDropTarget && hourTasks.length === 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="text-green-600 text-sm font-medium">여기에 놓기</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
