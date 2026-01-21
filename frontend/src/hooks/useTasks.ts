import { useState, useEffect } from 'react';
import { Task } from '@/types/task';
import { format } from 'date-fns';

// Mock data for development
const MOCK_TASKS: Task[] = [
    {
        id: '1',
        title: 'Morning Mediation',
        isCompleted: true,
        scheduledDate: format(new Date(), 'yyyy-MM-dd'),
        startTime: '07:00',
        duration: 30,
        createdAt: new Date().toISOString(),
    },
    {
        id: '2',
        title: 'Deep Work Session',
        isCompleted: false,
        scheduledDate: format(new Date(), 'yyyy-MM-dd'),
        startTime: '09:00',
        duration: 120,
        createdAt: new Date().toISOString(),
    },
    {
        id: '3',
        title: 'Check Emails',
        isCompleted: false,
        scheduledDate: format(new Date(), 'yyyy-MM-dd'),
        startTime: '13:00',
        duration: 30,
        createdAt: new Date().toISOString(),
    },
];

export const useTasks = (selectedDate: Date) => {
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        // In a real app, fetch from API based on selectedDate
        // For now, filtering mock data
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const dayTasks = MOCK_TASKS.filter(t => t.scheduledDate === dateStr);
        setTasks(dayTasks);
    }, [selectedDate]);

    const addTask = (title: string, time?: string) => {
        const newTask: Task = {
            id: Math.random().toString(36).substr(2, 9),
            title,
            isCompleted: false,
            scheduledDate: format(selectedDate, 'yyyy-MM-dd'),
            startTime: time,
            createdAt: new Date().toISOString(),
        };
        setTasks(prev => [...prev, newTask]);
        // Would call API here
    };

    const toggleTask = (taskId: string) => {
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
        ));
        // Would call API here
    };

    const deleteTask = (taskId: string) => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        // Would call API here
    };

    return {
        tasks,
        addTask,
        toggleTask,
        deleteTask
    };
};
