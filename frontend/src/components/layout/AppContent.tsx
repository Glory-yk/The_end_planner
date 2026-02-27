import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Hexagon, LogOut, Camera } from 'lucide-react';
import clsx from 'clsx';
import { App as CapApp } from '@capacitor/app';
import { format } from 'date-fns';

// Auth
import { useAuth } from '@/contexts/AuthContext';

// Store Provider
import { useAppStore } from '@/hooks/useAppStore';

// Planner Components
import { DateHeader } from '@/components/planner/DateHeader';
import { WeekCalendar } from '@/components/planner/WeekCalendar';
import { TaskList } from '@/components/planner/TaskList';
import { TimeSlots } from '@/components/planner/TimeSlots';
import { AddTaskInput } from '@/components/planner/AddTaskInput';
import { ProgressIndicator } from '@/components/planner/ProgressIndicator';
import { FocusQuote } from '@/components/planner/FocusQuote';
import { ViewToggle, ViewMode } from '@/components/planner/ViewToggle';
import { QuickAddModal } from '@/components/planner/QuickAddModal';
import { TaskPickerModal } from '@/components/planner/TaskPickerModal';
import { MonthlyCalendar } from '@/components/planner/MonthlyCalendar';
import { WeeklyScheduleView } from '@/components/planner/WeeklyScheduleView';
import { ScheduleAlertModal } from '@/components/planner/ScheduleAlertModal';
import { useScheduleNotification } from '@/hooks/useScheduleNotification';
import { SessionAssignModal } from '@/components/planner/SessionAssignModal';
import { TaskCompletionModal } from '@/components/planner/TaskCompletionModal';
import { MandalartDrawer } from '@/components/planner/MandalartDrawer';
import { Sidebar } from '@/components/layout/Sidebar';

// Mandalart Components
import { MandalartView } from '@/components/mandalart/MandalartView';

// Pomodoro Components
import { FloatingTimer } from '@/components/pomodoro/FloatingTimer';
import { usePomodoro } from '@/hooks/usePomodoro';
import { ThemeSelector } from '@/components/common/ThemeSelector';

// Auth Photo
import { AuthPhotoScreen } from '@/components/auth/AuthPhotoScreen';

type AppView = 'planner' | 'mandalart';

export const AppContent = () => {
    const { user, logout } = useAuth();
    const {
        getTasksForDate,
        addTask,
        toggleTask,
        deleteTask,
        updateTaskTime,
        editTask,
        tasks: allTasks,
        startTaskTimer,
        stopTaskTimer: storeStopTaskTimer,

        addFocusSession,
        syncWithGoogleCalendar
    } = useAppStore();

    // Session Assign Modal state
    const [completedSession, setCompletedSession] = useState<{ elapsedMinutes: number; endTime: Date } | null>(null);

    // Task Completion Modal state
    const [completionModalData, setCompletionModalData] = useState<{ taskId: string; elapsedMinutes: number; endTime: Date } | null>(null);

    // Pomodoro hook with task timer integration
    const pomodoro = usePomodoro({
        onTaskTimerStop: (elapsedMinutes, taskId) => {
            const endTime = new Date();

            if (taskId) {
                setCompletionModalData({ taskId, elapsedMinutes, endTime });
            } else {
                if (elapsedMinutes > 0) {
                    setCompletedSession({ elapsedMinutes, endTime });
                }
            }
            console.log(`Task timer stopped: ${elapsedMinutes} minutes`);
        }
    });

    const handleStartQuickFocus = () => {
        pomodoro.startWithTask();
    };

    const handleSessionAssign = async (taskId: string) => {
        if (completedSession) {
            const { elapsedMinutes, endTime } = completedSession;
            const startTime = new Date(endTime.getTime() - elapsedMinutes * 60000);
            const startTimeStr = startTime.toISOString();

            await addFocusSession({
                taskId,
                startTime: startTimeStr,
                endTime: endTime.toISOString(),
                duration: elapsedMinutes
            });

            storeStopTaskTimer(taskId, elapsedMinutes);
            setCompletedSession(null);
        }
    };

    const handleSessionCreate = async (title: string, scheduledDate?: string) => {
        if (completedSession) {
            const { elapsedMinutes, endTime } = completedSession;
            const startTime = new Date(endTime.getTime() - elapsedMinutes * 60000);
            const startTimePlanStr = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;

            const newTaskId = await addTask(title, scheduledDate, startTimePlanStr, undefined, undefined);

            if (newTaskId) {
                await addFocusSession({
                    taskId: newTaskId,
                    startTime: startTime.toISOString(),
                    endTime: endTime.toISOString(),
                    duration: elapsedMinutes
                });
                storeStopTaskTimer(newTaskId, elapsedMinutes);
            }

            setCompletedSession(null);
        }
    };

    const handleTaskCompleteConfirm = async () => {
        if (completionModalData) {
            const { taskId, elapsedMinutes, endTime } = completionModalData;
            const startTime = new Date(endTime.getTime() - elapsedMinutes * 60000);

            const taskToCheck = allTasks.find(t => t.id === taskId);
            if (taskToCheck && !taskToCheck.isCompleted) {
                await toggleTask(taskId);
            }

            await addFocusSession({
                taskId,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                duration: elapsedMinutes
            });

            storeStopTaskTimer(taskId, elapsedMinutes);
            setCompletionModalData(null);
        }
    };

    const handleTaskCompleteSaveOnly = async () => {
        if (completionModalData) {
            const { taskId, elapsedMinutes, endTime } = completionModalData;
            const startTime = new Date(endTime.getTime() - elapsedMinutes * 60000);

            await addFocusSession({
                taskId,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                duration: elapsedMinutes
            });

            storeStopTaskTimer(taskId, elapsedMinutes);
            setCompletionModalData(null);
        }
    };

    const handleStartTaskTimer = (taskId: string, taskTitle: string) => {
        startTaskTimer(taskId);
        pomodoro.startWithTask(taskId, taskTitle);
    };

    const [alertTask, setAlertTask] = useState<import('@/types/task').Task | null>(null);

    const { snoozeTask } = useScheduleNotification({
        tasks: allTasks,
        onTaskAlert: (task) => {
            setAlertTask(task);
        }
    });

    const handleAlertStartTimer = () => {
        if (alertTask) {
            handleStartTaskTimer(alertTask.id, alertTask.title);
            setAlertTask(null);
        }
    };

    const handleAlertSnooze = () => {
        if (alertTask) {
            snoozeTask(alertTask.id);
            setAlertTask(null);
        }
    };

    const handleAlertClose = () => {
        setAlertTask(null);
    };

    const [currentView, setCurrentView] = useState<AppView>('planner');
    const [authPhotoOpen, setAuthPhotoOpen] = useState(false);
    const [mandalartDrawerOpen, setMandalartDrawerOpen] = useState(false);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const tasks = getTasksForDate(selectedDate);
    const [viewMode, setViewMode] = useState<ViewMode>('today');
    const [quickAddTime, setQuickAddTime] = useState<string | null>(null);
    const [quickAddDuration, setQuickAddDuration] = useState<number | undefined>(undefined);

    const handleAddTask = (title: string, time?: string, projectId?: string) => {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        addTask(title, dateStr, time, undefined, undefined, projectId);
    };

    const handleAddTaskWithDuration = (title: string, time?: string, duration?: number) => {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        addTask(title, dateStr, time, undefined, duration);
    };

    const handleDragSelect = (startTime: string, _endTime: string, duration: number) => {
        setQuickAddTime(startTime);
        setQuickAddDuration(duration);
    };

    const [taskPickerTime, setTaskPickerTime] = useState<string | null>(null);
    const unscheduledTasks = tasks.filter(t => !t.startTime);

    const handleOpenTaskPicker = (time: string) => {
        setTaskPickerTime(time);
    };

    const handleSelectTaskFromPicker = (taskId: string) => {
        if (taskPickerTime) {
            updateTaskTime(taskId, taskPickerTime);
            setTaskPickerTime(null);
        }
    };

    const handleCreateNewFromPicker = () => {
        if (taskPickerTime) {
            setQuickAddTime(taskPickerTime);
            setQuickAddDuration(undefined);
            setTaskPickerTime(null);
        }
    };

    const handleWeeklyAddAtSlot = (date: Date, time: string) => {
        setSelectedDate(date);
        setQuickAddTime(time);
        setQuickAddDuration(undefined);
    };

    const handleBackButton = useCallback(() => {
        if (authPhotoOpen) {
            setAuthPhotoOpen(false);
            return;
        }

        if (quickAddTime) {
            setQuickAddTime(null);
            setQuickAddDuration(undefined);
            return;
        }
        if (taskPickerTime) {
            setTaskPickerTime(null);
            return;
        }
        if (completedSession) {
            setCompletedSession(null);
            return;
        }
        if (completionModalData) {
            setCompletionModalData(null);
            return;
        }
        if (alertTask) {
            setAlertTask(null);
            return;
        }

        CapApp.minimizeApp();
    }, [authPhotoOpen, quickAddTime, taskPickerTime, completedSession, alertTask]);

    useEffect(() => {
        const listener = CapApp.addListener('backButton', handleBackButton);

        return () => {
            listener.then(l => l.remove());
        };
    }, [handleBackButton]);

    const renderPlanner = () => (
        <motion.div
            key="planner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pb-4"
        >
            <DateHeader
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                viewMode={viewMode}
                onSync={async () => {
                    await syncWithGoogleCalendar();
                    alert('구글 캘린더와 동기화되었습니다.');
                }}
            />

            {viewMode === 'today' && (
                <WeekCalendar
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                />
            )}

            {viewMode === 'today' && <ProgressIndicator tasks={tasks} />}

            <div className="flex items-center justify-between px-6 mb-2">
                <ViewToggle mode={viewMode} onChange={setViewMode} />
                <button
                    onClick={() => setMandalartDrawerOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                >
                    <Hexagon className="w-4 h-4" />
                    <span className="hidden sm:inline">목표에서 추가</span></button>
            </div>

            <AnimatePresence mode="wait">
                {viewMode === 'today' ? (
                    <motion.div
                        key="today"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {tasks.length === 0 && <FocusQuote />}
                        <AddTaskInput onAdd={handleAddTask} />
                        <TaskList
                            tasks={tasks}
                            onToggle={toggleTask}
                            onDelete={deleteTask}
                            onUpdateTime={updateTaskTime}
                            onEdit={editTask}
                            onStartTimer={handleStartTaskTimer}
                            activeTimerTaskId={pomodoro.currentTaskId}
                        />

                        <TimeSlots
                            tasks={tasks}
                            onToggle={toggleTask}
                            onAddAtTime={(time) => {
                                setQuickAddTime(time);
                                setQuickAddDuration(undefined);
                            }}
                            onAssignTime={updateTaskTime}
                            onDragSelect={handleDragSelect}
                            onOpenTaskPicker={handleOpenTaskPicker}
                            activeTaskId={pomodoro.currentTaskId}
                            elapsedMinutes={pomodoro.elapsedMinutes}
                        />
                    </motion.div>
                ) : viewMode === 'week' ? (
                    <motion.div
                        key="week"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <WeeklyScheduleView
                            selectedDate={selectedDate}
                            tasks={allTasks}
                            onToggle={toggleTask}
                            onAddAtSlot={handleWeeklyAddAtSlot}
                            activeTaskId={pomodoro.currentTaskId}
                            elapsedMinutes={pomodoro.elapsedMinutes}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="month"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <MonthlyCalendar
                            currentDate={selectedDate}
                            tasks={allTasks}
                            onDateSelect={(date) => {
                                setSelectedDate(date);
                                setViewMode('today');
                            }}
                            onMonthChange={(date) => setSelectedDate(date)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <QuickAddModal
                isOpen={!!quickAddTime}
                time={quickAddTime || ''}
                duration={quickAddDuration}
                onClose={() => {
                    setQuickAddTime(null);
                    setQuickAddDuration(undefined);
                }}
                onAdd={handleAddTaskWithDuration}
            />

            <TaskPickerModal
                isOpen={!!taskPickerTime}
                time={taskPickerTime || ''}
                unscheduledTasks={unscheduledTasks}
                onClose={() => setTaskPickerTime(null)}
                onSelectTask={handleSelectTaskFromPicker}
                onCreateNew={handleCreateNewFromPicker}
            />
        </motion.div>
    );

    const renderMandalart = () => (
        <motion.div
            key="mandalart"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="pb-4 pt-6"
        >
            <div className="px-6 mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mandalart Goals</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">목표를 클릭하여 세부 계획을 세우세요</p>
            </div>
            <MandalartView onDateClick={(date) => {
                setSelectedDate(date);
                setViewMode('week');
                setCurrentView('planner');
            }} />
        </motion.div>
    );

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sidebar = (
        <Sidebar
            currentView={currentView}
            currentViewMode={viewMode}
            onViewChange={setCurrentView}
            onViewModeChange={setViewMode}
            user={user}
        />
    );

    return (
        <div className="h-full w-full bg-gray-50 dark:bg-slate-950 font-sans text-gray-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden flex">

            <div className="hidden md:block h-full transition-all duration-300 z-50">
                {sidebar}
            </div>

            <div className="flex-1 h-full flex flex-col overflow-hidden relative">
                <div className={clsx(
                    "h-full w-full bg-white dark:bg-slate-950 flex flex-col transition-colors duration-300 relative",
                    "md:w-full md:max-w-none",
                    "mx-auto",
                    isMobile ? "max-w-lg shadow-xl dark:shadow-black/20" : ""
                )}>

                    {user && isMobile && (
                        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 z-50 relative" style={{ paddingTop: 'max(8px, env(safe-area-inset-top))' }}>
                            <div className="flex items-center gap-2">
                                {user.picture && (
                                    <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                                )}
                                <span className="text-sm text-gray-700 dark:text-slate-300">{user.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <ThemeSelector />
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {!isMobile && (
                        <div className="h-4 w-full bg-transparent flex-shrink-0" />
                    )}

                    <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-0 md:px-8">
                        <div className="max-w-5xl mx-auto w-full h-full pb-20">
                            <AnimatePresence mode="wait">
                                {currentView === 'planner' ? renderPlanner() : renderMandalart()}
                            </AnimatePresence>
                        </div>
                    </div>

                    {isMobile && (
                        <div className="flex-shrink-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 z-40 transition-colors duration-300" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
                            <div className="flex items-center justify-around p-2">
                                <button
                                    onClick={() => setCurrentView('planner')}
                                    className={clsx(
                                        "flex flex-col items-center gap-1 p-2 rounded-xl transition-colors w-20",
                                        currentView === 'planner'
                                            ? "text-primary bg-primary/10 dark:bg-primary/20"
                                            : "text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                                    )}
                                >
                                    <Calendar className="w-6 h-6" />
                                    <span className="text-[10px] font-medium">PLANNER</span>
                                </button>

                                <button
                                    onClick={() => setCurrentView('mandalart')}
                                    className={clsx(
                                        "flex flex-col items-center gap-1 p-2 rounded-xl transition-colors w-20",
                                        currentView === 'mandalart'
                                            ? "text-primary bg-primary/10 dark:bg-primary/20"
                                            : "text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                                    )}
                                >
                                    <Hexagon className="w-6 h-6" />
                                    <span className="text-[10px] font-medium">MANDALART</span>
                                </button>

                                <button
                                    onClick={() => setAuthPhotoOpen(true)}
                                    className="flex flex-col items-center gap-1 p-2 rounded-xl transition-colors w-20 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                                >
                                    <Camera className="w-6 h-6" />
                                    <span className="text-[10px] font-medium">인증샷</span>
                                </button>
                            </div>
                        </div>
                    )}

                    <FloatingTimer
                        timeLeft={pomodoro.timeLeft}
                        isActive={pomodoro.isActive}
                        sessionType={pomodoro.sessionType}
                        toggleTimer={pomodoro.toggleTimer}
                        resetTimer={pomodoro.resetTimer}
                        formatTime={pomodoro.formatTime}
                        timerMode={pomodoro.timerMode}
                        currentTaskId={pomodoro.currentTaskId}
                        currentTaskTitle={pomodoro.currentTaskTitle}
                        formatElapsedTime={pomodoro.formatElapsedTime}
                        elapsedMinutes={pomodoro.elapsedMinutes}
                        stopTaskTimer={pomodoro.stopTaskTimer}
                        cancelTaskTimer={pomodoro.cancelTaskTimer}
                        onStartQuickFocus={handleStartQuickFocus}
                    />

                    <TaskCompletionModal
                        isOpen={!!completionModalData}
                        task={allTasks.find(t => t.id === completionModalData?.taskId)}
                        elapsedMinutes={completionModalData?.elapsedMinutes || 0}
                        onClose={() => setCompletionModalData(null)}
                        onComplete={handleTaskCompleteConfirm}
                        onSaveOnly={handleTaskCompleteSaveOnly}
                    />

                    <SessionAssignModal
                        isOpen={!!completedSession}
                        elapsedMinutes={completedSession?.elapsedMinutes || 0}
                        tasks={tasks}
                        onClose={() => setCompletedSession(null)}
                        onAssign={handleSessionAssign}
                        onCreate={handleSessionCreate}
                        onDiscard={() => setCompletedSession(null)}
                    />

                    <ScheduleAlertModal
                        isOpen={!!alertTask}
                        task={alertTask}
                        onClose={handleAlertClose}
                        onStartTimer={handleAlertStartTimer}
                        onSnooze={handleAlertSnooze}
                    />

                    <AuthPhotoScreen
                        isOpen={authPhotoOpen}
                        onClose={() => setAuthPhotoOpen(false)}
                    />

                    <MandalartDrawer
                        isOpen={mandalartDrawerOpen}
                        onClose={() => setMandalartDrawerOpen(false)}
                        selectedDate={selectedDate}
                    />

                </div>
            </div>
        </div>
    );
};
