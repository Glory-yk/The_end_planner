import { useState, useEffect, useCallback, useRef } from 'react';
import { Task } from '@/types/task';
import { format } from 'date-fns';

interface UseScheduleNotificationOptions {
    tasks: Task[];
    onTaskAlert: (task: Task) => void;
}

export const useScheduleNotification = ({ tasks, onTaskAlert }: UseScheduleNotificationOptions) => {
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
    const [snoozedTasks, setSnoozedTasks] = useState<Map<string, number>>(new Map()); // taskId -> snooze until timestamp
    const alertedTasksRef = useRef<Set<string>>(new Set()); // Track already alerted tasks in this session

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window) {
            setNotificationPermission(Notification.permission);

            if (Notification.permission === 'default') {
                Notification.requestPermission().then((permission) => {
                    setNotificationPermission(permission);
                });
            }
        }
    }, []);

    // Check for scheduled tasks every 30 seconds
    useEffect(() => {
        const checkScheduledTasks = () => {
            const now = new Date();
            const todayStr = format(now, 'yyyy-MM-dd');

            tasks.forEach((task) => {
                // Skip if task is already completed, has no start time, or is not for today
                if (task.isCompleted || !task.startTime || task.scheduledDate !== todayStr) {
                    return;
                }

                // Check if task is snoozed
                const snoozeUntil = snoozedTasks.get(task.id);
                if (snoozeUntil && now.getTime() < snoozeUntil) {
                    return;
                }

                // Check if already alerted in this session (within last minute)
                const alertKey = `${task.id}-${task.startTime}`;
                if (alertedTasksRef.current.has(alertKey)) {
                    return;
                }

                // Check if it's time for this task (within 1 minute window)
                const [taskHour, taskMinute] = task.startTime.split(':').map(Number);
                const taskTimeMinutes = taskHour * 60 + taskMinute;
                const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();

                // Alert if current time matches task time (within 1 minute)
                if (currentTimeMinutes >= taskTimeMinutes && currentTimeMinutes < taskTimeMinutes + 1) {
                    alertedTasksRef.current.add(alertKey);
                    onTaskAlert(task);

                    // Also send browser notification if permitted
                    if (notificationPermission === 'granted') {
                        new Notification('📋 예정된 일정', {
                            body: `${task.title}\n시작 시간: ${task.startTime}`,
                            icon: '/favicon.ico',
                            tag: task.id,
                            requireInteraction: true
                        });
                    }
                }
            });
        };

        // Initial check
        checkScheduledTasks();

        // Check every 30 seconds
        const intervalId = setInterval(checkScheduledTasks, 30000);

        return () => clearInterval(intervalId);
    }, [tasks, snoozedTasks, notificationPermission, onTaskAlert]);

    // Snooze a task for 5 minutes
    const snoozeTask = useCallback((taskId: string) => {
        const snoozeUntil = Date.now() + 5 * 60 * 1000; // 5 minutes from now
        setSnoozedTasks((prev) => {
            const newMap = new Map(prev);
            newMap.set(taskId, snoozeUntil);
            return newMap;
        });
    }, []);

    // Clear snooze for a task
    const clearSnooze = useCallback((taskId: string) => {
        setSnoozedTasks((prev) => {
            const newMap = new Map(prev);
            newMap.delete(taskId);
            return newMap;
        });
    }, []);

    // Request notification permission manually
    const requestPermission = useCallback(async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
            return permission;
        }
        return 'denied' as NotificationPermission;
    }, []);

    return {
        notificationPermission,
        snoozeTask,
        clearSnooze,
        requestPermission
    };
};
