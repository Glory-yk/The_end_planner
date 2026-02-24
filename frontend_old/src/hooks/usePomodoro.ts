import { useState, useEffect, useRef, useCallback } from 'react';
import { registerPlugin } from '@capacitor/core';
import { PluginListenerHandle } from '@capacitor/core';

interface WearSyncPlugin {
    addListener(eventName: 'timerSessionReceived', listenerFunc: (data: { durationMinutes: number; taskId?: string }) => void): Promise<PluginListenerHandle> & PluginListenerHandle;
}

const WearSync = registerPlugin<WearSyncPlugin>('WearSync');

type SessionType = 'FOCUS' | 'BREAK';
type TimerMode = 'pomodoro' | 'task'; // pomodoro: 기존 25/5분 모드, task: 태스크 시간 측정 모드

interface UsePomodoroOptions {
    onTimerComplete?: () => void;
    onTaskTimerStop?: (elapsedMinutes: number, taskId: string | null) => void;
}

export const usePomodoro = (options?: UsePomodoroOptions) => {
    // Pomodoro mode state
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [sessionType, setSessionType] = useState<SessionType>('FOCUS');

    // Task timer mode state
    const [timerMode, setTimerMode] = useState<TimerMode>('pomodoro');
    const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
    const [currentTaskTitle, setCurrentTaskTitle] = useState<string>('');
    const [taskStartTime, setTaskStartTime] = useState<Date | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    // UseRef for interval to avoid re-renders issues
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Wear OS Sync Listener
    useEffect(() => {
        let listener: Promise<PluginListenerHandle> | null = null;

        const setupListener = async () => {
            try {
                listener = WearSync.addListener('timerSessionReceived', (data) => {
                    console.log('⌚ Watch Sync Received:', data);
                    if (data.durationMinutes > 0) {
                        playSound();
                        options?.onTaskTimerStop?.(data.durationMinutes, data.taskId || null);
                    }
                });
            } catch (e) {
                console.warn('WearSync plugin setup failed (running in browser?)', e);
            }
        };

        setupListener();

        return () => {
            if (listener) {
                listener.then(handle => handle.remove().catch(() => { }));
            }
        };
    }, [options]);

    // Pomodoro countdown effect
    useEffect(() => {
        if (timerMode === 'pomodoro' && isActive && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timerMode === 'pomodoro' && timeLeft === 0) {
            handleTimerComplete();
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, timeLeft, timerMode]);

    // Task timer (count up) effect
    useEffect(() => {
        if (timerMode === 'task' && isActive && taskStartTime) {
            intervalRef.current = setInterval(() => {
                const now = new Date();
                const elapsed = Math.floor((now.getTime() - taskStartTime.getTime()) / 1000);
                setElapsedSeconds(elapsed);
            }, 1000);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, timerMode, taskStartTime]);

    const handleTimerComplete = () => {
        setIsActive(false);
        // Play sound
        playSound();

        options?.onTimerComplete?.();

        // Switch modes and auto-reset time
        if (sessionType === 'FOCUS') {
            setSessionType('BREAK');
            setTimeLeft(5 * 60);
        } else {
            setSessionType('FOCUS');
            setTimeLeft(25 * 60);
        }
    };

    const playSound = () => {
        new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play().catch(() => { });
    };

    // ============ POMODORO MODE ============

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(sessionType === 'FOCUS' ? 25 * 60 : 5 * 60);
    };

    // ============ TASK TIMER MODE ============

    const startWithTask = useCallback((taskId?: string, taskTitle?: string) => {
        // 이미 진행 중인 타이머가 있으면 중지
        if (isActive) {
            stopTaskTimer();
        }

        setTimerMode('task');
        setCurrentTaskId(taskId || null);
        setCurrentTaskTitle(taskTitle || '');
        setTaskStartTime(new Date());
        setElapsedSeconds(0);
        setIsActive(true);

        // 시작 소리
        playSound();
    }, [isActive]);

    const stopTaskTimer = useCallback(() => {
        if (timerMode === 'task' && taskStartTime) {
            const elapsedMinutes = Math.round(elapsedSeconds / 60);

            // 종료 소리
            playSound();

            options?.onTaskTimerStop?.(elapsedMinutes, currentTaskId);

            // Reset task timer state
            setIsActive(false);
            setCurrentTaskId(null);
            setCurrentTaskTitle('');
            setTaskStartTime(null);
            setElapsedSeconds(0);
            setTimerMode('pomodoro');

            return elapsedMinutes;
        }
        return 0;
    }, [timerMode, taskStartTime, elapsedSeconds, options]);

    const cancelTaskTimer = useCallback(() => {
        setIsActive(false);
        setCurrentTaskId(null);
        setCurrentTaskTitle('');
        setTaskStartTime(null);
        setElapsedSeconds(0);
        setTimerMode('pomodoro');
    }, []);

    // ============ FORMATTERS ============

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const formatElapsedTime = () => {
        const hours = Math.floor(elapsedSeconds / 3600);
        const minutes = Math.floor((elapsedSeconds % 3600) / 60);
        const seconds = elapsedSeconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const elapsedMinutes = Math.round(elapsedSeconds / 60);

    return {
        // Pomodoro mode
        timeLeft,
        isActive,
        sessionType,
        toggleTimer,
        resetTimer,
        formatTime,

        // Task timer mode
        timerMode,
        currentTaskId,
        currentTaskTitle,
        elapsedSeconds,
        elapsedMinutes,
        startWithTask,
        stopTaskTimer,
        cancelTaskTimer,
        formatElapsedTime
    };
};
