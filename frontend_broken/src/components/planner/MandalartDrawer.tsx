import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Hexagon, ArrowLeft } from 'lucide-react';
import { useAppStore } from '@/hooks/useAppStore';
import clsx from 'clsx';
import { GoalTodoModal } from '@/components/mandalart/GoalTodoModal';

const GRID_COLORS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    'var(--color-primary)',
    '#06b6d4', '#3b82f6', '#a855f7', '#ec4899'
];

interface MandalartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: Date;
}

export const MandalartDrawer = ({ isOpen, onClose }: MandalartDrawerProps) => {
    const { mandalartData } = useAppStore();
    const [selectedGoalIndex, setSelectedGoalIndex] = useState<number | null>(null);
    // 선택된 셀 정보를 저장하여 모달을 띄움
    const [selectedCell, setSelectedCell] = useState<{ gridIndex: number; cellIndex: number; text: string; color: string } | null>(null);

    // Sub-Goals (그리드 0-3, 5-8의 중앙 셀)
    const subGoals = [0, 1, 2, 3, 5, 6, 7, 8].map(index => ({
        gridIndex: index,
        title: mandalartData[index]?.title || '',
        color: GRID_COLORS[index],
        cells: mandalartData[index]?.cells || [],
        icon: mandalartData[index]?.cellIcons?.[4] || null
    })).filter(goal => goal.title.trim() !== '');

    const getCellsForGrid = (gridIndex: number) => {
        const cells = mandalartData[gridIndex]?.cells || [];
        // 외부 8개 셀 (중앙 제외). 인덱스 순서대로 반환
        return [0, 1, 2, 3, 5, 6, 7, 8].map(idx => ({
            index: idx,
            text: cells[idx] || ''
        }));
    };

    const selectedGoal = selectedGoalIndex !== null
        ? subGoals.find(g => g.gridIndex === selectedGoalIndex) || { title: 'Unknown', color: '#ccc', gridIndex: -1, icon: null }
        : null;

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col"
                        >
                            <AnimatePresence mode="wait">
                                {selectedGoalIndex === null ? (
                                    /* VIEW 1: Goal List */
                                    <motion.div
                                        key="goal-list"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="flex flex-col h-full"
                                    >
                                        {/* Header */}
                                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                                            <div className="flex items-center gap-2">
                                                <Hexagon className="w-5 h-5 text-primary" />
                                                <h2 className="font-bold text-gray-900 dark:text-white">목표 선택</h2>
                                            </div>
                                            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
                                                <X className="w-5 h-5 text-gray-500" />
                                            </button>
                                        </div>

                                        {/* List */}
                                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                            {subGoals.length === 0 ? (
                                                <div className="text-center py-10 text-gray-400">
                                                    <p>설정된 목표가 없습니다.</p>
                                                </div>
                                            ) : (
                                                subGoals.map((goal) => (
                                                    <button
                                                        key={goal.gridIndex}
                                                        onClick={() => setSelectedGoalIndex(goal.gridIndex)}
                                                        className="w-full flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all border border-gray-100 dark:border-slate-700"
                                                    >
                                                        <div
                                                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-bold shadow-sm"
                                                            style={{ backgroundColor: goal.color }}
                                                        >
                                                            {goal.icon || goal.title.charAt(0)}
                                                        </div>
                                                        <div className="flex-1 text-left">
                                                            <h3 className="font-bold text-gray-900 dark:text-white">{goal.title}</h3>
                                                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                                                                {getCellsForGrid(goal.gridIndex).filter(c => c.text).length}개의 세부 계획
                                                            </p>
                                                        </div>
                                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                ) : (
                                    /* VIEW 2: Detail Cell List */
                                    <motion.div
                                        key="goal-detail"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="flex flex-col h-full"
                                    >
                                        {/* Header */}
                                        <div
                                            className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-slate-700"
                                            style={{ backgroundColor: `${selectedGoal?.color}10` }}
                                        >
                                            <button
                                                onClick={() => setSelectedGoalIndex(null)}
                                                className="p-1 rounded-full hover:bg-white/50 transition-colors"
                                            >
                                                <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-slate-300" />
                                            </button>
                                            <h2 className="font-bold text-gray-900 dark:text-white truncate flex-1">
                                                {selectedGoal?.title}
                                            </h2>
                                            <div
                                                className="w-6 h-6 rounded flex items-center justify-center text-xs text-white mobile-hidden"
                                                style={{ backgroundColor: selectedGoal?.color }}
                                            >
                                                {selectedGoal?.icon || selectedGoal?.title.charAt(0)}
                                            </div>
                                        </div>

                                        {/* Content - 8 Cells List */}
                                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                            {selectedGoal && getCellsForGrid(selectedGoal.gridIndex).map((cell) => {
                                                const hasContent = !!cell.text.trim();
                                                return (
                                                    <button
                                                        key={cell.index}
                                                        onClick={() => {
                                                            if (hasContent) {
                                                                setSelectedCell({
                                                                    gridIndex: selectedGoal.gridIndex,
                                                                    cellIndex: cell.index,
                                                                    text: cell.text,
                                                                    color: selectedGoal.color
                                                                });
                                                            }
                                                        }}
                                                        disabled={!hasContent}
                                                        className={clsx(
                                                            "w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                                                            hasContent
                                                                ? "bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-primary/50 hover:shadow-sm cursor-pointer"
                                                                : "bg-gray-50 dark:bg-slate-800/50 border-transparent opacity-50 cursor-default"
                                                        )}
                                                    >
                                                        <span className={clsx(
                                                            "text-sm",
                                                            hasContent ? "text-gray-900 dark:text-slate-200" : "text-gray-400"
                                                        )}>
                                                            {hasContent ? cell.text : "(비어 있음)"}
                                                        </span>
                                                        {hasContent && <ChevronRight className="w-4 h-4 text-gray-400" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Level 3: GoalTodoModal */}
            {selectedCell && (
                <GoalTodoModal
                    isOpen={true}
                    gridIndex={selectedCell.gridIndex}
                    cellIndex={selectedCell.cellIndex}
                    goalText={selectedCell.text}
                    gridColor={selectedCell.color}
                    onClose={() => setSelectedCell(null)}
                />
            )}
        </>
    );
};
