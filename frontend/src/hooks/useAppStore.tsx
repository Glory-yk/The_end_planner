import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { Capacitor } from '@capacitor/core';
import client from '@/api/client';
import { Task, FocusSession } from '@/types/task';
import { MandalartData, DEFAULT_CATEGORIES } from '@/types/mandalart';
import { Todo } from '@/types/todo';
import { format } from 'date-fns';
import { taskApi, focusSessionApi } from '@/api/taskApi';
import { mandalartApi } from '@/api/mandalartApi';
import WearSync, { WearTimerSession } from '@/plugins/WearSyncPlugin';

// ============================================
// UNIFIED APP STORE
// Manages both Tasks and Mandalart data (via API with localStorage fallback)
// ============================================

const MANDALART_STORAGE_KEY = 'mandalart_data_v2';
const SYNC_DEBOUNCE_MS = 1000; // Debounce server sync by 1 second

// Initial Mandalart Data with linking support
const createInitialMandalartData = (): MandalartData =>
    Array(9).fill(null).map((_, i) => ({
        id: i,
        title: '',
        cells: Array(9).fill(''),
        linkedTaskIds: Array(9).fill([]).map(() => []),
        cellProgress: Array(9).fill(0),
        cellTodos: Array(9).fill([]).map(() => []),
        cellIcons: Array(9).fill(null)
    }));

interface AppStoreContextType {
    // Tasks
    tasks: Task[];
    isLoading: boolean;
    error: string | null;
    addTask: (title: string, scheduledDate?: string, startTime?: string, mandalartRef?: { gridIndex: number; cellIndex: number }, duration?: number) => Promise<string>;
    toggleTask: (taskId: string) => void;
    deleteTask: (taskId: string) => void;
    getTasksForDate: (date: Date) => Task[];
    getLinkedTasks: (gridIndex: number, cellIndex: number) => Task[];
    updateTaskTime: (taskId: string, startTime: string | undefined) => void;
    refreshTasks: () => Promise<void>;

    // Timer
    activeTimerTaskId: string | null;
    startTaskTimer: (taskId: string) => void;
    stopTaskTimer: (taskId: string, overrideDuration?: number) => void;
    getActiveTimerTask: () => Task | null;

    // Mandalart
    mandalartData: MandalartData;
    updateMandalartCell: (gridIndex: number, cellIndex: number, value: string) => void;
    getCellProgress: (gridIndex: number, cellIndex: number) => number;
    getSubGoalProgress: (gridIndex: number) => number;
    getCategoryColor: (gridIndex: number) => string;

    // Todo
    addTodo: (gridIndex: number, cellIndex: number, text: string) => void;
    toggleTodo: (gridIndex: number, cellIndex: number, todoId: string) => void;
    deleteTodo: (gridIndex: number, cellIndex: number, todoId: string) => void;
    getTodosForCell: (gridIndex: number, cellIndex: number) => Todo[];
    convertTodoToTask: (gridIndex: number, cellIndex: number, todoId: string, scheduledDate?: string) => Promise<void>;

    // Integration
    addTaskFromMandalart: (gridIndex: number, cellIndex: number, scheduledDate?: string) => void;
    updateMandalartIcon: (gridIndex: number, icon: string, cellIndex?: number) => void;

    // Wear OS
    syncWearSession: (session: WearTimerSession) => Promise<Task | null>;

    // Focus Sessions
    focusSessions: FocusSession[];
    addFocusSession: (session: { taskId?: string; startTime: string; endTime: string; duration: number; memo?: string }) => Promise<FocusSession>;
    fetchFocusSessions: (startDate: string, endDate: string) => Promise<void>;
    linkFocusSession: (sessionId: string, taskId: string) => Promise<void>;
}

const AppStoreContext = createContext<AppStoreContextType | null>(null);

export const useAppStore = () => {
    const context = useContext(AppStoreContext);
    if (!context) {
        throw new Error('useAppStore must be used within AppStoreProvider');
    }
    return context;
};

interface AppStoreProviderProps {
    children: ReactNode;
}

export const AppStoreProvider = ({ children }: AppStoreProviderProps) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mandalartData, setMandalartData] = useState<MandalartData>(createInitialMandalartData());
    const [activeTimerTaskId, setActiveTimerTaskId] = useState<string | null>(null);
    const [, setMandalartSyncing] = useState(false);
    const mandalartSyncTimer = useRef<NodeJS.Timeout | null>(null);
    const isInitialLoad = useRef(true);

    // Load tasks from API on mount
    const refreshTasks = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const allTasks = await taskApi.getAll();
            setTasks(allTasks);
        } catch (err) {
            console.error('Failed to load tasks:', err);
            setError('Failed to load tasks from server');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshTasks();
    }, [refreshTasks]);

    // Load Mandalart: Try server first, fallback to localStorage
    useEffect(() => {
        const loadMandalart = async () => {
            try {
                // Try to load from server
                const serverData = await mandalartApi.get();
                if (serverData && serverData.length > 0) {
                    // Migration: ensure cellTodos exists
                    const migratedData = serverData.map((grid: MandalartData[number]) => ({
                        ...grid,
                        cellTodos: grid.cellTodos || Array(9).fill(null).map(() => []),
                        cells: grid.cells || Array(9).fill(''),
                        linkedTaskIds: grid.linkedTaskIds || Array(9).fill(null).map(() => []),
                        cellProgress: grid.cellProgress || Array(9).fill(0),
                        cellIcons: grid.cellIcons || Array(9).fill(null)
                    }));
                    setMandalartData(migratedData);
                    // Also save to localStorage as cache
                    localStorage.setItem(MANDALART_STORAGE_KEY, JSON.stringify(migratedData));
                    console.log('Mandalart loaded from server');
                    isInitialLoad.current = false;
                    return;
                }
            } catch (err) {
                console.log('Server mandalart not available, trying localStorage:', err);
            }

            // Fallback to localStorage
            const savedMandalart = localStorage.getItem(MANDALART_STORAGE_KEY);
            if (savedMandalart) {
                try {
                    const data = JSON.parse(savedMandalart);
                    const migratedData = data.map((grid: MandalartData[number]) => ({
                        ...grid,
                        cellTodos: grid.cellTodos || Array(9).fill(null).map(() => []),
                        cells: grid.cells || Array(9).fill(''),
                        linkedTaskIds: grid.linkedTaskIds || Array(9).fill(null).map(() => []),
                        cellProgress: grid.cellProgress || Array(9).fill(0),
                        cellIcons: grid.cellIcons || Array(9).fill(null)
                    }));
                    setMandalartData(migratedData);
                    console.log('Mandalart loaded from localStorage');

                    // Try to sync localStorage data to server (migration)
                    try {
                        await mandalartApi.update(migratedData);
                        console.log('LocalStorage mandalart migrated to server');
                    } catch (syncErr) {
                        console.log('Failed to migrate mandalart to server:', syncErr);
                    }
                } catch (e) {
                    console.error('Failed to parse localStorage mandalart');
                }
            }
            isInitialLoad.current = false;
        };

        loadMandalart();
    }, []);

    // Debounced sync to server when mandalartData changes
    useEffect(() => {
        // Skip initial load to avoid unnecessary sync
        if (isInitialLoad.current) return;

        // Clear existing timer
        if (mandalartSyncTimer.current) {
            clearTimeout(mandalartSyncTimer.current);
        }

        // Save to localStorage immediately (as cache)
        localStorage.setItem(MANDALART_STORAGE_KEY, JSON.stringify(mandalartData));

        // Debounce server sync
        mandalartSyncTimer.current = setTimeout(async () => {
            try {
                setMandalartSyncing(true);
                await mandalartApi.update(mandalartData);
                console.log('Mandalart synced to server');
            } catch (err) {
                console.error('Failed to sync mandalart to server:', err);
                // Temporary: Alert the user so they know save failed
                alert('Mandalart 저장 실패! 데이터가 커서 저장되지 않았을 수 있습니다. 관리자에게 문의하세요.');
            } finally {
                setMandalartSyncing(false);
            }
        }, SYNC_DEBOUNCE_MS);

        return () => {
            if (mandalartSyncTimer.current) {
                clearTimeout(mandalartSyncTimer.current);
            }
        };
    }, [mandalartData]);

    // Restore active timer from tasks on load
    useEffect(() => {
        const runningTask = tasks.find(t => t.timerStartedAt);
        if (runningTask) {
            setActiveTimerTaskId(runningTask.id);
        }
    }, [tasks]);

    // ============ TASK ACTIONS ============

    const addTask = async (
        title: string,
        scheduledDate?: string,
        startTime?: string,
        mandalartRef?: { gridIndex: number; cellIndex: number },
        duration?: number
    ): Promise<string> => {
        try {
            const newTask = await taskApi.create({
                title,
                isCompleted: false,
                scheduledDate: scheduledDate || format(new Date(), 'yyyy-MM-dd'),
                startTime,
                duration,
                mandalartRef
            });

            setTasks(prev => [...prev, newTask]);

            // If linked to Mandalart, update the linkedTaskIds
            if (mandalartRef) {
                setMandalartData(prev => {
                    const newData = JSON.parse(JSON.stringify(prev));
                    newData[mandalartRef.gridIndex].linkedTaskIds[mandalartRef.cellIndex].push(newTask.id);
                    return newData;
                });
            }

            return newTask.id;
        } catch (err) {
            console.error('Failed to create task:', err);
            throw err;
        }
    };

    const toggleTask = async (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const newCompleted = !task.isCompleted;

        // Optimistic update
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, isCompleted: newCompleted } : t
        ));

        try {
            await taskApi.update(taskId, { isCompleted: newCompleted });

            // If task has mandalartRef, recalculate progress
            if (task.mandalartRef) {
                const { gridIndex, cellIndex } = task.mandalartRef;
                recalculateProgress(gridIndex, cellIndex, tasks.map(t =>
                    t.id === taskId ? { ...t, isCompleted: newCompleted } : t
                ));
            }
        } catch (err) {
            console.error('Failed to toggle task:', err);
            // Revert on error
            setTasks(prev => prev.map(t =>
                t.id === taskId ? { ...t, isCompleted: !newCompleted } : t
            ));
        }
    };

    const deleteTask = async (taskId: string) => {
        const taskToDelete = tasks.find(t => t.id === taskId);
        if (!taskToDelete) return;

        // Optimistic update
        setTasks(prev => prev.filter(t => t.id !== taskId));

        try {
            await taskApi.delete(taskId);

            // If linked to Mandalart, remove from linkedTaskIds and recalculate
            if (taskToDelete.mandalartRef) {
                const { gridIndex, cellIndex } = taskToDelete.mandalartRef;

                setMandalartData(prev => {
                    const newData = JSON.parse(JSON.stringify(prev));
                    newData[gridIndex].linkedTaskIds[cellIndex] =
                        newData[gridIndex].linkedTaskIds[cellIndex].filter((id: string) => id !== taskId);

                    // Recalculate progress
                    const remainingLinkedIds = newData[gridIndex].linkedTaskIds[cellIndex];
                    const remainingTasks = tasks.filter(t => remainingLinkedIds.includes(t.id) && t.id !== taskId);
                    const completed = remainingTasks.filter(t => t.isCompleted).length;
                    newData[gridIndex].cellProgress[cellIndex] =
                        remainingTasks.length > 0 ? Math.round((completed / remainingTasks.length) * 100) : 0;

                    return newData;
                });
            }
        } catch (err) {
            console.error('Failed to delete task:', err);
            // Revert on error
            setTasks(prev => [...prev, taskToDelete]);
        }
    };

    const getTasksForDate = (date: Date): Task[] => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return tasks.filter(t => t.scheduledDate === dateStr);
    };

    const getLinkedTasks = (gridIndex: number, cellIndex: number): Task[] => {
        const linkedIds = mandalartData[gridIndex]?.linkedTaskIds[cellIndex] || [];
        return tasks.filter(t => linkedIds.includes(t.id));
    };

    const updateTaskTime = async (taskId: string, startTime: string | undefined) => {
        // Optimistic update
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, startTime } : t
        ));

        try {
            await taskApi.update(taskId, { startTime });
        } catch (err) {
            console.error('Failed to update task time:', err);
            // Revert would need original value, skip for now
        }
    };

    // ============ TIMER ACTIONS ============

    const startTaskTimer = async (taskId: string) => {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const todayStr = format(now, 'yyyy-MM-dd');

        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const updates: Partial<Task> = {
            timerStartedAt: now.toISOString(),
            startTime: task.startTime || currentTime,
            scheduledDate: task.scheduledDate || todayStr
        };

        // Optimistic update
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, ...updates } : t
        ));
        setActiveTimerTaskId(taskId);

        try {
            await taskApi.update(taskId, updates);
        } catch (err) {
            console.error('Failed to start timer:', err);
        }
    };

    const stopTaskTimer = async (taskId: string, overrideDuration?: number) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        let durationToAdd = 0;

        if (overrideDuration !== undefined) {
            durationToAdd = overrideDuration;
        } else if (task.timerStartedAt) {
            const startTime = new Date(task.timerStartedAt);
            const endTime = new Date();
            durationToAdd = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
        }

        const newActualDuration = (task.actualDuration || 0) + durationToAdd;

        // Optimistic update
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, timerStartedAt: undefined, actualDuration: newActualDuration } : t
        ));
        setActiveTimerTaskId(null);

        try {
            await taskApi.update(taskId, {
                timerStartedAt: undefined,
                actualDuration: newActualDuration
            });
        } catch (err) {
            console.error('Failed to stop timer:', err);
        }
    };

    const getActiveTimerTask = (): Task | null => {
        if (!activeTimerTaskId) return null;
        return tasks.find(t => t.id === activeTimerTaskId) || null;
    };

    // ============ MANDALART ACTIONS ============

    const updateMandalartCell = (gridIndex: number, cellIndex: number, value: string) => {
        setMandalartData(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            newData[gridIndex].cells[cellIndex] = value;

            // Sync logic (same as before)
            const CENTER_GRID_INDEX = 4;

            if (gridIndex === CENTER_GRID_INDEX && cellIndex !== 4) {
                newData[cellIndex].title = value;
                newData[cellIndex].cells[4] = value;
            }

            if (gridIndex !== CENTER_GRID_INDEX && cellIndex === 4) {
                newData[gridIndex].title = value;
                newData[CENTER_GRID_INDEX].cells[gridIndex] = value;
            }

            return newData;
        });
    };

    const getCellProgress = (gridIndex: number, cellIndex: number): number => {
        return mandalartData[gridIndex]?.cellProgress[cellIndex] || 0;
    };

    // Sub-Goal 진행률: 해당 그리드의 모든 연결된 Task 완료율
    const getSubGoalProgress = (gridIndex: number): number => {
        const grid = mandalartData[gridIndex];
        if (!grid) return 0;

        // 모든 셀의 연결된 Task ID 수집
        const linkedIdsRef = grid.linkedTaskIds;
        if (!Array.isArray(linkedIdsRef)) return 0;

        const allLinkedIds = linkedIdsRef.reduce<string[]>((acc, curr) => {
            if (Array.isArray(curr)) return acc.concat(curr);
            return acc;
        }, []);

        const linkedTasks = tasks.filter(t => allLinkedIds.includes(t.id));
        if (linkedTasks.length === 0) return 0;

        const completed = linkedTasks.filter(t => t.isCompleted).length;
        return Math.round((completed / linkedTasks.length) * 100);
    };

    const getCategoryColor = (gridIndex: number): string => {
        const category = DEFAULT_CATEGORIES.find(c => c.gridIndex === gridIndex);
        return category?.color || '#6b7280';
    };

    // ============ TODO ACTIONS ============

    const addTodo = (gridIndex: number, cellIndex: number, text: string) => {
        if (!text.trim()) return;

        const newTodo: Todo = {
            id: crypto.randomUUID(),
            text: text.trim(),
            isCompleted: false,
            createdAt: new Date().toISOString()
        };

        setMandalartData(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            if (!newData[gridIndex].cellTodos) {
                newData[gridIndex].cellTodos = Array(9).fill(null).map(() => []);
            }
            newData[gridIndex].cellTodos[cellIndex].push(newTodo);
            return newData;
        });
    };

    const toggleTodo = (gridIndex: number, cellIndex: number, todoId: string) => {
        setMandalartData(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            const todos = newData[gridIndex].cellTodos[cellIndex];
            const todoIndex = todos.findIndex((t: Todo) => t.id === todoId);
            if (todoIndex !== -1) {
                todos[todoIndex].isCompleted = !todos[todoIndex].isCompleted;
            }
            return newData;
        });
    };

    const deleteTodo = (gridIndex: number, cellIndex: number, todoId: string) => {
        // Find todo to check for converted task
        const todos = mandalartData[gridIndex]?.cellTodos?.[cellIndex] || [];
        const todoToDelete = todos.find((t: Todo) => t.id === todoId);

        // If converted to task, delete the task as well
        if (todoToDelete?.convertedTaskId) {
            deleteTask(todoToDelete.convertedTaskId);
        }

        setMandalartData(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            newData[gridIndex].cellTodos[cellIndex] =
                newData[gridIndex].cellTodos[cellIndex].filter((t: Todo) => t.id !== todoId);
            return newData;
        });
    };

    const getTodosForCell = (gridIndex: number, cellIndex: number): Todo[] => {
        return mandalartData[gridIndex]?.cellTodos?.[cellIndex] || [];
    };

    const convertTodoToTask = async (
        gridIndex: number,
        cellIndex: number,
        todoId: string,
        scheduledDate?: string
    ) => {
        const todos = mandalartData[gridIndex]?.cellTodos?.[cellIndex] || [];
        const todo = todos.find((t: Todo) => t.id === todoId);
        if (!todo) return;

        try {
            // Task 생성
            const newTaskId = await addTask(
                todo.text,
                scheduledDate,
                undefined,
                { gridIndex, cellIndex }
            );

            // Todo에 convertedTaskId 기록
            setMandalartData(prev => {
                const newData = JSON.parse(JSON.stringify(prev));
                const todoIndex = newData[gridIndex].cellTodos[cellIndex]
                    .findIndex((t: Todo) => t.id === todoId);
                if (todoIndex !== -1) {
                    newData[gridIndex].cellTodos[cellIndex][todoIndex].convertedTaskId = newTaskId;
                }
                return newData;
            });
        } catch (err) {
            console.error('Failed to convert todo to task:', err);
        }
    };

    // ============ INTEGRATION ============

    const addTaskFromMandalart = (gridIndex: number, cellIndex: number, scheduledDate?: string | null) => {
        const cellText = mandalartData[gridIndex]?.cells[cellIndex];
        if (!cellText?.trim()) return;

        addTask(
            cellText,
            scheduledDate || undefined,
            undefined,
            { gridIndex, cellIndex }
        );
    };

    const recalculateProgress = (gridIndex: number, cellIndex: number, currentTasks: Task[]) => {
        setMandalartData(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            const linkedIds = newData[gridIndex].linkedTaskIds[cellIndex];
            const linkedTasks = currentTasks.filter(t => linkedIds.includes(t.id));
            const completed = linkedTasks.filter(t => t.isCompleted).length;

            newData[gridIndex].cellProgress[cellIndex] =
                linkedTasks.length > 0 ? Math.round((completed / linkedTasks.length) * 100) : 0;

            return newData;
        });
    };

    const updateMandalartIcon = (gridIndex: number, icon: string, cellIndex: number = 4) => {
        setMandalartData(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            if (!newData[gridIndex].cellIcons) {
                newData[gridIndex].cellIcons = Array(9).fill(null);
            }
            newData[gridIndex].cellIcons[cellIndex] = icon;

            // Sync legacy icon field for backward compatibility
            if (cellIndex === 4) {
                newData[gridIndex].icon = icon;
            }
            return newData;
        });
    };

    // ============ WEAR OS SYNC ============

    const syncWearSession = useCallback(async (session: WearTimerSession): Promise<Task | null> => {
        try {
            console.log('Syncing wear session:', session);
            const newTask = await taskApi.syncWearSession({
                title: session.title,
                startTimeMillis: session.startTimeMillis,
                endTimeMillis: session.endTimeMillis,
                durationMinutes: session.durationMinutes,
                taskId: session.taskId
            });

            // Update local state
            setTasks(prev => {
                const existing = prev.find(t => t.id === newTask.id);
                if (existing) {
                    return prev.map(t => t.id === newTask.id ? newTask : t);
                }
                return [...prev, newTask];
            });

            console.log('Wear session synced successfully:', newTask);
            return newTask;
        } catch (err) {
            console.error('Failed to sync wear session:', err);
            return null;
        }
    }, []);

    // Listen for Wear OS timer sessions
    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        let listenerHandle: { remove: () => void } | null = null;

        const setupWearListener = async () => {
            try {
                listenerHandle = await WearSync.addListener('timerSessionReceived', (session) => {
                    console.log('Received timer session from watch:', session);
                    syncWearSession(session);
                });
                console.log('Wear OS listener registered');
            } catch (err) {
                console.log('Wear OS not available:', err);
            }
        };

        setupWearListener();

        return () => {
            if (listenerHandle) {
                listenerHandle.remove();
            }
        };
    }, [syncWearSession]);

    // ============ FOCUS SESSION ACTIONS ============

    const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);

    const addFocusSession = async (sessionData: { taskId?: string; startTime: string; endTime: string; duration: number; memo?: string }) => {
        try {
            const newSession = await focusSessionApi.create(sessionData);
            setFocusSessions(prev => [...prev, newSession]);

            // If linked to a task, update the task's focusSessions list locally if possible
            if (sessionData.taskId) {
                setTasks(prev => prev.map(t => {
                    if (t.id === sessionData.taskId) {
                        const sessions = t.focusSessions ? [...t.focusSessions, newSession] : [newSession];
                        return { ...t, focusSessions: sessions };
                    }
                    return t;
                }));
            }

            return newSession;
        } catch (err) {
            console.error('Failed to add focus session:', err);
            throw err;
        }
    };

    const fetchFocusSessions = async (startDate: string, endDate: string) => {
        try {
            // This endpoint needs to be added to focusSessionApi or taskApi
            // For now, let's assume valid implementation or mock
            const response = await client.get(`/focus-sessions?startDate=${startDate}&endDate=${endDate}`);
            setFocusSessions(response.data);
        } catch (err) {
            console.error('Failed to fetch focus sessions:', err);
        }
    };

    const linkFocusSession = async (sessionId: string, taskId: string) => {
        try {
            const updatedSession = await focusSessionApi.linkToTask(sessionId, taskId);

            // Update local state
            setFocusSessions(prev => prev.map(s => s.id === sessionId ? updatedSession : s));

            // Update task state locally
            setTasks(prev => prev.map(t => {
                if (t.id === taskId) {
                    const sessions = t.focusSessions ? [...t.focusSessions, updatedSession] : [updatedSession];
                    return { ...t, focusSessions: sessions };
                }
                return t;
            }));
        } catch (err) {
            console.error('Failed to link focus session:', err);
        }
    };

    const value: AppStoreContextType = {
        tasks,
        isLoading,
        error,
        addTask,
        toggleTask,
        deleteTask,
        getTasksForDate,
        getLinkedTasks,
        updateTaskTime,
        refreshTasks,
        // Timer
        activeTimerTaskId,
        startTaskTimer,
        stopTaskTimer,
        getActiveTimerTask,
        // Mandalart
        mandalartData,
        updateMandalartCell,
        getCellProgress,
        getSubGoalProgress,
        getCategoryColor,
        // Todo
        addTodo,
        toggleTodo,
        deleteTodo,
        getTodosForCell,
        convertTodoToTask,
        addTaskFromMandalart,
        updateMandalartIcon,
        // Wear OS
        syncWearSession,
        // Focus Sessions
        focusSessions,
        addFocusSession,
        fetchFocusSessions,
        linkFocusSession
    };

    return (
        <AppStoreContext.Provider value={value}>
            {children}
        </AppStoreContext.Provider>
    );
};
