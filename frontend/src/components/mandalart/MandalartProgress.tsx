import { motion } from 'framer-motion';
import { CheckCircle2, Target } from 'lucide-react';
import { MandalartGridData } from '@/types/mandalart';
import clsx from 'clsx';

interface MandalartProgressProps {
    mandalartData: MandalartGridData[];
    onHintClick?: (gridIndex: number) => void;
}

export const MandalartProgress = ({ mandalartData, onHintClick }: MandalartProgressProps) => {
    // Calculate total filled cells (excluding center cells)
    const getTotalProgress = () => {
        let totalCells = 0;
        let filledCells = 0;

        mandalartData.forEach((grid) => {
            grid.cells.forEach((cell: string, cellIndex: number) => {
                // Skip center cells (index 4)
                if (cellIndex !== 4) {
                    totalCells++;
                    if (cell && cell.trim() !== '') {
                        filledCells++;
                    }
                }
            });
        });

        const percentage = totalCells > 0 ? Math.round((filledCells / totalCells) * 100) : 0;
        return { filledCells, totalCells, percentage };
    };

    const progress = getTotalProgress();

    // Get next empty cell suggestion
    const getNextEmptyCell = () => {
        for (let gridIdx = 0; gridIdx < 9; gridIdx++) {
            for (let cellIdx = 0; cellIdx < 9; cellIdx++) {
                if (cellIdx === 4) continue; // Skip center
                const cell = mandalartData[gridIdx]?.cells[cellIdx];
                if (!cell || cell.trim() === '') {
                    return { gridIndex: gridIdx, cellIndex: cellIdx };
                }
            }
        }
        return null;
    };

    const nextEmpty = getNextEmptyCell();

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-2xl p-5 shadow-sm border border-primary/20"
        >
            {/* Progress Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-gray-900 dark:text-white">작성 진행률</h3>
                </div>
                <span className="text-2xl font-bold text-primary">
                    {progress.percentage}%
                </span>
            </div>

            {/* Progress Bar */}
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                />
            </div>

            {/* Progress Stats */}
            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-slate-300">
                    {progress.filledCells} / {progress.totalCells} 칸 작성 완료
                </span>
                {progress.percentage === 100 && (
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        완료!
                    </div>
                )}
            </div>

            {/* Next Step Hint */}
            {progress.percentage < 100 && nextEmpty && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={clsx(
                        "mt-4 pt-4 border-t border-primary/20",
                        onHintClick && "cursor-pointer group"
                    )}
                    onClick={() => onHintClick?.(nextEmpty.gridIndex)}
                >
                    <div className="flex items-start gap-2 p-2 -mx-2 rounded-lg transition-colors group-hover:bg-primary/5">
                        <span className="text-lg">💡</span>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-700 dark:text-slate-200">
                                    다음 단계
                                </p>
                                {onHintClick && (
                                    <div className="text-primary text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                                        이동하기
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                                {nextEmpty.gridIndex === 4
                                    ? "중심 목표의 세부 항목을 작성해보세요"
                                    : `목표 ${nextEmpty.gridIndex > 4 ? nextEmpty.gridIndex : nextEmpty.gridIndex + 1}의 세부 항목을 채워보세요`
                                }
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};
