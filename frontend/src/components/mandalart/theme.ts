import { GridTheme } from '@/types/mandalart';

const createTheme = (color: string, r: number, g: number, b: number): GridTheme => ({
    color,
    bgStrong: `rgba(${r}, ${g}, ${b}, 0.25)`,
    bgMedium: `rgba(${r}, ${g}, ${b}, 0.12)`,
    bgLight: `rgba(${r}, ${g}, ${b}, 0.06)`,
    bgSubtle: `rgba(${r}, ${g}, ${b}, 0.03)`,
    border: `rgba(${r}, ${g}, ${b}, 0.3)`,
});

export const MANDALART_THEMES: Record<number, GridTheme> = {
    0: createTheme('#3b82f6', 59, 130, 246), // Blue
    1: createTheme('#10b981', 16, 185, 129), // Emerald
    2: createTheme('#a855f7', 168, 85, 247), // Purple
    3: createTheme('#f97316', 249, 115, 22), // Orange
    4: {
        color: 'var(--color-primary)',
        bgStrong: 'rgba(var(--color-primary-rgb), 0.25)',
        bgMedium: 'rgba(var(--color-primary-rgb), 0.12)',
        bgLight: 'rgba(var(--color-primary-rgb), 0.06)',
        bgSubtle: 'rgba(var(--color-primary-rgb), 0.03)',
        border: 'rgba(var(--color-primary-rgb), 0.3)',
    },
    5: createTheme('#f59e0b', 245, 158, 11), // Amber
    6: createTheme('#64748b', 100, 116, 139), // Slate
    7: createTheme('#06b6d4', 6, 182, 212), // Cyan
    8: createTheme('#ef4444', 239, 68, 68), // Red
};
