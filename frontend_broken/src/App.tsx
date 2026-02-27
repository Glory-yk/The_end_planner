import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Hexagon, LogOut, Camera } from 'lucide-react';
import { Routes, Route } from 'react-router-dom';
import clsx from 'clsx';
import { App as CapApp } from '@capacitor/app';
import { format } from 'date-fns';

// Auth
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LoginPage } from '@/components/auth/LoginPage';

// Store Provider
import { AppStoreProvider, useAppStore } from '@/hooks/useAppStore';

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
import { PrivacyPolicy } from '@/components/PrivacyPolicy';

// Pomodoro Components
import { FloatingTimer } from '@/components/pomodoro/FloatingTimer';
import { usePomodoro } from '@/hooks/usePomodoro';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ThemeSelector } from '@/components/common/ThemeSelector';

// Auth Photo
import { AuthPhotoScreen } from '@/components/auth/AuthPhotoScreen';

type AppView = 'planner' | 'mandalart';

const AppContent = () => {
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

      // If valid taskId exists (pre-assigned), ask for completion
      if (taskId) {
        setCompletionModalData({ taskId, elapsedMinutes, endTime });
      } else {
        // If Quick Focus (no taskId), open assign modal
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
      const startTimeStr = startTime.toISOString(); // Full timestamp for FocusSession

      // 1. Create Focus Session
      await addFocusSession({
        taskId,
        startTime: startTimeStr,
        endTime: endTime.toISOString(),
        duration: elapsedMinutes
      });

      // 2. Legacy update
      storeStopTaskTimer(taskId, elapsedMinutes);

      // 3. Optional: If task has no start time, set it?
      // For now, let's update task time if it was unplanned
      // updateTaskTime(taskId, startTimePlanStr);

      setCompletedSession(null);
    }
  };

  const handleSessionCreate = async (title: string, scheduledDate?: string) => {
    if (completedSession) {
      const { elapsedMinutes, endTime } = completedSession;
      const startTime = new Date(endTime.getTime() - elapsedMinutes * 60000);
      const startTimePlanStr = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;

      // 1. Create Task (Plan)
      const newTaskId = await addTask(title, scheduledDate, startTimePlanStr, undefined, undefined);

      if (newTaskId) {
        // 2. Create Focus Session (Action)
        await addFocusSession({
          taskId: newTaskId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          duration: elapsedMinutes
        });

        // 3. Legacy update
        storeStopTaskTimer(newTaskId, elapsedMinutes);
      }

      setCompletedSession(null);
    }
  };

  const handleTaskCompleteConfirm = async () => {
    if (completionModalData) {
      const { taskId, elapsedMinutes, endTime } = completionModalData;
      const startTime = new Date(endTime.getTime() - elapsedMinutes * 60000);

      // 1. Mark task as completed if not already
      const taskToCheck = allTasks.find(t => t.id === taskId);
      if (taskToCheck && !taskToCheck.isCompleted) {
        await toggleTask(taskId);
      }

      // 2. Create Focus Session
      await addFocusSession({
        taskId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: elapsedMinutes
      });

      // 3. Legacy update
      storeStopTaskTimer(taskId, elapsedMinutes);

      setCompletionModalData(null);
    }
  };

  const handleTaskCompleteSaveOnly = async () => {
    if (completionModalData) {
      const { taskId, elapsedMinutes, endTime } = completionModalData;
      const startTime = new Date(endTime.getTime() - elapsedMinutes * 60000);

      // 1. Create Focus Session (without completing task)
      await addFocusSession({
        taskId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: elapsedMinutes
      });

      // 2. Legacy update
      storeStopTaskTimer(taskId, elapsedMinutes);

      setCompletionModalData(null);
    }
  };

  // Handler to start timer for a task
  const handleStartTaskTimer = (taskId: string, taskTitle: string) => {
    startTaskTimer(taskId);
    pomodoro.startWithTask(taskId, taskTitle);
  };

  // Schedule notification state
  const [alertTask, setAlertTask] = useState<import('@/types/task').Task | null>(null);

  // Schedule notification hook
  const { snoozeTask } = useScheduleNotification({
    tasks: allTasks,
    onTaskAlert: (task) => {
      setAlertTask(task);
    }
  });

  // Handle alert modal actions
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

  // Global State
  const [currentView, setCurrentView] = useState<AppView>('planner');
  const [authPhotoOpen, setAuthPhotoOpen] = useState(false);
  const [mandalartDrawerOpen, setMandalartDrawerOpen] = useState(false);

  // Planner State
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [quickAddTime, setQuickAddTime] = useState<string | null>(null);
  const [quickAddDuration, setQuickAddDuration] = useState<number | undefined>(undefined);

  const tasks = getTasksForDate(selectedDate);

  const handleAddTask = (title: string, time?: string, duration?: number) => {
    // FIX: Use local date format instead of ISO string (which converts to UTC and causes date shift)
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    addTask(title, dateStr, time, undefined, duration);
  };

  // For drag-to-schedule in TimeSlots
  const handleDragSelect = (startTime: string, _endTime: string, duration: number) => {
    setQuickAddTime(startTime);
    setQuickAddDuration(duration);
  };

  // For task picker modal
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

  // For weekly view - add to specific date+time
  const handleWeeklyAddAtSlot = (date: Date, time: string) => {
    setSelectedDate(date);
    setQuickAddTime(time);
    setQuickAddDuration(undefined);
  };

  // Android Back Button Handler
  const handleBackButton = useCallback(() => {
    // 인증사진 화면이 열려있으면 닫기
    if (authPhotoOpen) {
      setAuthPhotoOpen(false);
      return;
    }

    // 모달이 열려있으면 닫기
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

    // 메인 화면에서는 앱 최소화
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
            {/* Add Task Input - top of list */}
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
        onAdd={handleAddTask}
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

  // Responsive Layout Helper
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prepare sidebar props
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

      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block h-full transition-all duration-300 z-50">
        {sidebar}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full flex flex-col overflow-hidden relative">
        <div className={clsx(
          "h-full w-full bg-white dark:bg-slate-950 flex flex-col transition-colors duration-300 relative",
          // Mobile: Center centered max-w-lg
          // Desktop: Full width, no max-w constraint
          "md:w-full md:max-w-none",
          "mx-auto", // Center on mobile
          isMobile ? "max-w-lg shadow-xl dark:shadow-black/20" : ""
        )}>

          {/* User Info Header - Mobile Only */}
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

          {/* Desktop Header (Optional - maybe just spacing or breadcrumbs) */}
          {!isMobile && (
            <div className="h-4 w-full bg-transparent flex-shrink-0" /> // Spacer
          )}

          {/* Main Content - Scrollable */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-0 md:px-8">
            <div className="max-w-5xl mx-auto w-full h-full pb-20"> {/* Max width container for desktop content */}
              <AnimatePresence mode="wait">
                {currentView === 'planner' ? renderPlanner() : renderMandalart()}
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom Navigation - Mobile Only */}
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

                {/* 인증샷 FAB 버튼 */}
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

          {/* Floating Pomodoro Timer */}
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

          {/* Schedule Alert Modal */}
          <ScheduleAlertModal
            isOpen={!!alertTask}
            task={alertTask}
            onClose={handleAlertClose}
            onStartTimer={handleAlertStartTimer}
            onSnooze={handleAlertSnooze}
          />

          {/* Auth Photo Screen */}
          <AuthPhotoScreen
            isOpen={authPhotoOpen}
            onClose={() => setAuthPhotoOpen(false)}
          />

          {/* Mandalart Drawer */}
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

// Wrapper that handles auth state
const AuthenticatedApp = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <AppStoreProvider>
      <AppContent />
    </AppStoreProvider>
  );
};

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <Routes>
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="*" element={<AuthenticatedApp />} />
      </Routes>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
