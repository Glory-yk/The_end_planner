import { Todo } from './todo';

export interface MandalartCellData {
    text: string;
    isCompleted: boolean;
    linkedTaskIds: string[];  // IDs of tasks linked to this cell
    progress: number;         // 0-100 based on linked task completion
}

export interface GridTheme {
    color: string;
    bgStrong: string;
    bgMedium: string;
    bgLight: string;
    bgSubtle: string;
    border: string;
}

export interface MandalartGridData {
    id: number; // 0-8
    title: string; // For sub-grids, this mimics the center cell
    cells: string[]; // Simple array of 9 strings for cell values
    linkedTaskIds: string[][]; // 9 arrays, one per cell
    cellProgress: number[];    // 9 values, progress per cell
    cellTodos: Todo[][];       // 9 arrays of todos, one per cell
    subGoalProgress?: number;  // Overall completion of all tasks in this sub-grid (center cell)
    icon?: string;             // Legacy: Grid representative icon (Sub-Goal)
    cellIcons?: string[];      // Icons for each of the 9 cells
}

// Category for color sync between Mandalart and Planner
export interface MandalartCategory {
    id: string;
    name: string;
    color: string;      // CSS color value
    gridIndex: number;  // Which sub-grid this category represents
}

// Default categories mapped to grid indices (0-8, excluding 4 which is center)
export const DEFAULT_CATEGORIES: MandalartCategory[] = [
    { id: 'cat-0', name: '목표 1', color: '#ef4444', gridIndex: 0 },
    { id: 'cat-1', name: '목표 2', color: '#f97316', gridIndex: 1 },
    { id: 'cat-2', name: '목표 3', color: '#eab308', gridIndex: 2 },
    { id: 'cat-3', name: '목표 4', color: '#22c55e', gridIndex: 3 },
    { id: 'cat-5', name: '목표 5', color: '#14b8a6', gridIndex: 5 },
    { id: 'cat-6', name: '목표 6', color: '#3b82f6', gridIndex: 6 },
    { id: 'cat-7', name: '목표 7', color: '#8b5cf6', gridIndex: 7 },
    { id: 'cat-8', name: '목표 8', color: '#ec4899', gridIndex: 8 },
];

// We will stick to a flat structure of 9 grids, each with 9 cells
export type MandalartData = MandalartGridData[];
