import { MandalartGridData } from '@/types/mandalart';
import { MandalartCell } from './MandalartCell';
import clsx from 'clsx';

interface MandalartGridProps {
    data: MandalartGridData;
    gridIndex: number;
    isCenterGrid: boolean;
    gridColor?: string;
    subGoalProgress?: number; // Pass progress for this grid
    onUpdate: (cellIndex: number, value: string) => void;
    onOpenTodos?: (cellIndex: number) => void;
    onZoom?: () => void;
    onIconClick?: (cellIndex: number) => void;
}

export const MandalartGrid = ({
    data,
    gridIndex: _gridIndex,
    isCenterGrid,
    gridColor,
    subGoalProgress,
    onUpdate,
    onOpenTodos,
    onIconClick
}: MandalartGridProps) => {
    void _gridIndex; // Suppress unused warning
    return (
        <div
            className={clsx(
                "grid grid-cols-3 gap-1 p-1 rounded-xl transition-colors duration-300",
                // Unified Style: Subtle gray background for sub-grids
                isCenterGrid
                    ? "bg-transparent"
                    : "bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700"
            )}
        >
            {data.cells.map((cellValue, index) => {
                const isCellCenter = index === 4;
                const progress = data.cellProgress?.[index] || 0;
                // Show todo count only when interactive (zoomed in)
                const todoCount = onOpenTodos ? (data.cellTodos?.[index]?.length || 0) : 0;
                const cellSubGoalProgress = isCellCenter ? subGoalProgress : undefined;

                // Determine icon: try cellIcons first, fallback to legacy icon for center cell
                const icon = data.cellIcons?.[index] || (isCellCenter ? data.icon : undefined);
                const isZoomed = !!onIconClick;

                return (
                    <MandalartCell
                        key={index}
                        value={cellValue}
                        cellIndex={index}
                        isCenter={isCellCenter}
                        isCore={isCenterGrid && isCellCenter}
                        gridColor={gridColor}
                        progress={progress}
                        subGoalProgress={cellSubGoalProgress}
                        todoCount={todoCount}
                        icon={icon}
                        onChange={(val) => onUpdate(index, val)}
                        onOpenTodos={
                            !isCenterGrid && !isCellCenter && cellValue?.trim() && onOpenTodos
                                ? () => onOpenTodos(index)
                                : undefined
                        }
                        onIconClick={
                            onIconClick && (!isCenterGrid || isCellCenter)
                                ? () => onIconClick(index)
                                : undefined
                        }
                        isZoomed={isZoomed}
                    />
                );
            })}
        </div>
    );
};
