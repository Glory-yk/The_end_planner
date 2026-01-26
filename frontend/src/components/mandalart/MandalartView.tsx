import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { MandalartGrid } from './MandalartGrid';
import { MandalartRadarChart } from './MandalartRadarChart';
import { GoalTodoModal } from './GoalTodoModal';
import { MandalartWizard, WizardResult, CATEGORIES } from './MandalartWizard';
import { SubGoalInputModal } from './SubGoalInputModal';
import { MandalartHelpCenter } from './MandalartHelpCenter';
import { MotivationalToast } from './MotivationalToast';
import { MAIN_GOAL_TEMPLATES } from '@/data/mandalartTemplates';
import { getQuoteByCategory, MotivationalQuote } from '@/data/motivationalQuotes';
import { MandalartGridData } from '@/types/mandalart';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomOut, Wand2, HelpCircle, Target, BarChart3, Hexagon, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import EmojiPicker, { EmojiClickData, Categories, EmojiStyle, SuggestionMode } from 'emoji-picker-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import clsx from 'clsx';

const GRID_COLORS = [
    '#ef4444', // Red
    '#f97316', // Orange
    '#eab308', // Yellow
    '#22c55e', // Green
    '',        // Center (Primary)
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
    '#a855f7', // Purple
    '#ec4899', // Pink
];

// 작성 진행률 계산 함수
const getProgressPercentage = (mandalartData: MandalartGridData[]): number => {
    let totalCells = 0;
    let filledCells = 0;

    mandalartData?.forEach((grid) => {
        grid?.cells?.forEach((cell: string, cellIndex: number) => {
            if (cellIndex !== 4) {
                totalCells++;
                if (cell && cell.trim() !== '') {
                    filledCells++;
                }
            }
        });
    });

    return totalCells > 0 ? Math.round((filledCells / totalCells) * 100) : 0;
};

type ViewMode = 'mandalart' | 'achievement';

interface MandalartViewProps {
    onDateClick?: (date: Date) => void;
}

export const MandalartView = ({ onDateClick }: MandalartViewProps) => {
    const {
        mandalartData,
        updateMandalartCell,
        updateMandalartIcon,
        getSubGoalProgress,
        tasks
    } = useAppStore();

    const [viewMode, setViewMode] = useState<ViewMode>('mandalart');
    const [zoomedGrid, setZoomedGrid] = useState<number | null>(null);
    const [wizardOpen, setWizardOpen] = useState(false);
    const [helpCenterOpen, setHelpCenterOpen] = useState(false);
    const [motivationalQuote, setMotivationalQuote] = useState<MotivationalQuote | null>(null);
    const [toastAction, setToastAction] = useState<{ label: string; action: () => void } | null>(null);

    // Achievement View State
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
    const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

    // Today's Stats
    const todayStats = useMemo(() => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const todayTasks = tasks.filter(t => t.scheduledDate === todayStr);
        const completed = todayTasks.filter(t => t.isCompleted).length;
        const total = todayTasks.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { completed, total, percentage };
    }, [tasks]);

    // Monthly Calendar Data
    const monthlyCalendar = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const days = eachDayOfInterval({ start: startDate, end: endDate });

        return days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayTasks = tasks
                .filter(t => t.scheduledDate === dateStr)
                .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

            const completed = dayTasks.filter(t => t.isCompleted).length;
            const total = dayTasks.length;

            return {
                date: day,
                isCurrentMonth: isSameMonth(day, currentMonth),
                isToday: isSameDay(day, new Date()),
                tasks: dayTasks,
                completed,
                total,
                hasTasks: total > 0,
                percentage: total > 0 ? (completed / total) * 100 : 0
            };
        });
    }, [currentMonth, tasks]);

    // Mandalart Stats
    const mandalartStats = useMemo(() => {
        const subGoals = [0, 1, 2, 3, 5, 6, 7, 8].map(index => ({
            title: mandalartData[index].title || `Goal ${index + 1}`,
            progress: getSubGoalProgress(index),
            color: mandalartData[index].title ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500',
            gridColor: GRID_COLORS[index]
        }));

        const totalProgress = Math.round(subGoals.reduce((acc, curr) => acc + curr.progress, 0) / 8);
        return { subGoals, totalProgress };
    }, [mandalartData, getSubGoalProgress]);

    // Todo modal state
    const [todoModalOpen, setTodoModalOpen] = useState(false);
    const [selectedCell, setSelectedCell] = useState<{ gridIndex: number; cellIndex: number } | null>(null);

    // Emoji Picker state
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
    const [targetGridIndex, setTargetGridIndex] = useState<number | null>(null);
    const [targetCellIndex, setTargetCellIndex] = useState<number | null>(null);

    // SubGoal Input Modal state (직접입력/AI추천 선택)
    const [subGoalInputModalOpen, setSubGoalInputModalOpen] = useState(false);
    const [subGoalInputGridIndex, setSubGoalInputGridIndex] = useState<number | null>(null);

    // Show motivational quote or onboarding on mount
    useEffect(() => {
        const isCenterGoalEmpty = !mandalartData[4]?.cells[4]?.trim();

        if (isCenterGoalEmpty) {
            setMotivationalQuote({
                text: "✨ 목표 설정이 처음이신가요? 맞춤 생성으로 쉽고 빠르게 시작해보세요!",
                category: 'start'
            });
            setToastAction({
                label: "맞춤 생성 마법사 시작",
                action: () => setWizardOpen(true)
            });
        } else {
            const quote = getQuoteByCategory('start');
            setMotivationalQuote(quote);
            setToastAction(null);
        }
    }, []);

    const handleOpenTodos = (gridIndex: number, cellIndex: number) => {
        setSelectedCell({ gridIndex, cellIndex });
        setTodoModalOpen(true);
    };

    const handleCloseTodoModal = () => {
        setTodoModalOpen(false);
        setSelectedCell(null);
    };

    // Sub-Goal 그리드 클릭 시 (빈 셀이면 입력 방법 선택 모달)
    const handleSubGoalGridClick = (gridIndex: number) => {
        // 중앙 그리드(4)는 제외
        if (gridIndex === 4) {
            setZoomedGrid(gridIndex);
            return;
        }

        // 해당 그리드의 세부 목표(중앙 제외 8칸)가 비어있는지 확인
        const grid = mandalartData[gridIndex];
        const outerCells = [0, 1, 2, 3, 5, 6, 7, 8];
        const isEmpty = outerCells.every(i => !grid?.cells[i]?.trim());

        if (isEmpty && grid?.cells[4]?.trim()) {
            // Sub-Goal은 있지만 세부 목표가 비어있으면 입력 방법 선택 모달
            setSubGoalInputGridIndex(gridIndex);
            setSubGoalInputModalOpen(true);
        } else {
            // 일반 줌인
            setZoomedGrid(gridIndex);
        }
    };

    const handleSubGoalInputManual = () => {
        // 직접 입력 선택 시 해당 그리드로 줌인
        if (subGoalInputGridIndex !== null) {
            setZoomedGrid(subGoalInputGridIndex);
        }
    };

    const handleSubGoalInputRecommendation = (suggestions: string[]) => {
        // AI 추천 적용
        if (subGoalInputGridIndex !== null) {
            handleApplySubGoalDetails(subGoalInputGridIndex, suggestions);
        }
    };

    const handleIconClick = (gridIndex: number, cellIndex: number) => {
        setTargetGridIndex(gridIndex);
        setTargetCellIndex(cellIndex);
        setEmojiPickerOpen(true);
    };

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        if (targetGridIndex !== null && targetCellIndex !== null) {
            updateMandalartIcon(targetGridIndex, emojiData.emoji, targetCellIndex);
        }
        setEmojiPickerOpen(false);
        setTargetGridIndex(null);
        setTargetCellIndex(null);
    };

    const handleRemoveIcon = () => {
        if (targetGridIndex !== null && targetCellIndex !== null) {
            updateMandalartIcon(targetGridIndex, '', targetCellIndex);
        }
        setEmojiPickerOpen(false);
        setTargetGridIndex(null);
        setTargetCellIndex(null);
    };

    const handleApplySubGoalDetails = (gridIndex: number, suggestions: string[]) => {
        // Apply suggestions to the 8 surrounding cells (excluding center)
        const cellIndices = [0, 1, 2, 3, 5, 6, 7, 8];
        suggestions.forEach((suggestion, index) => {
            if (index < cellIndices.length) {
                const cellIndex = cellIndices[index];
                const currentValue = mandalartData[gridIndex]?.cells[cellIndex];
                // Only apply if empty
                if (!currentValue || !currentValue.trim()) {
                    updateMandalartCell(gridIndex, cellIndex, suggestion);
                }
            }
        });

        // Show motivational quote
        const quote = getQuoteByCategory('progress');
        setMotivationalQuote(quote);
    };

    const handleWizardComplete = (result: WizardResult) => {
        // 선택된 카테고리들을 Main Goal 주변 8칸에 배치
        const gridIndices = [0, 1, 2, 3, 5, 6, 7, 8]; // 중앙(4) 제외
        const isOverwrite = result.editMode;

        result.selectedCategories.forEach((categoryValue, index) => {
            if (index < gridIndices.length) {
                const gridIndex = gridIndices[index];
                const category = CATEGORIES.find(c => c.value === categoryValue);
                const template = MAIN_GOAL_TEMPLATES.find(t => t.id === categoryValue);

                if (category && template) {
                    // Sub-Goal 중앙 셀에 카테고리 이름 설정
                    const currentValue = mandalartData[gridIndex]?.cells[4];
                    // 덮어쓰기 모드이거나 빈 칸일 때만 업데이트
                    if (isOverwrite || !currentValue || !currentValue.trim()) {
                        updateMandalartCell(gridIndex, 4, template.name);
                        // 아이콘 설정
                        updateMandalartIcon(gridIndex, category.icon, 4);
                    }
                }
            }
        });

        // Show completion quote
        const quote = getQuoteByCategory('complete');
        setMotivationalQuote(quote);
    };

    const getSelectedCellData = () => {
        if (!selectedCell) return { goalText: '', gridColor: '' };
        const { gridIndex, cellIndex } = selectedCell;
        const goalText = mandalartData[gridIndex]?.cells[cellIndex] || '';
        const gridColor = GRID_COLORS[gridIndex];
        return { goalText, gridColor };
    };

    const progressPercentage = getProgressPercentage(mandalartData);

    // 성취도 뷰 렌더링
    const renderAchievementView = () => (
        <div className="flex flex-col gap-4 p-4 pb-24 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Today's Focus Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        Today's Focus
                    </h2>
                    <span className="text-2xl font-bold text-primary">{todayStats.percentage}%</span>
                </div>

                <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${todayStats.percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-primary rounded-full"
                    />
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{todayStats.completed} 완료</span>
                    <span>총 {todayStats.total}개</span>
                </div>
            </div>

            {/* Mandalart Radar Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col items-center">
                <h2 className="w-full font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Balance Analysis
                </h2>
                <MandalartRadarChart
                    data={mandalartStats.subGoals.map(g => ({
                        label: g.title,
                        value: g.progress,
                        color: g.gridColor
                    }))}
                />
            </div>

            {/* List Overview */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Hexagon className="w-5 h-5 text-primary" />
                        Details
                    </h2>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total: {mandalartStats.totalProgress}%</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    {mandalartStats.subGoals.map((goal, i) => (
                        <div key={i} className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-xl flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: goal.gridColor }}
                                    />
                                    <span className={clsx("text-xs font-medium line-clamp-1", goal.color)}>
                                        {goal.title}
                                    </span>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">
                                    {goal.progress}%
                                </span>
                            </div>
                            <div className="h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${goal.progress}%`, backgroundColor: goal.gridColor }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Monthly Overview (Calendar) */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-indigo-500" />
                        Monthly Overview
                    </h2>
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                            <ChevronLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[80px] text-center">
                            {format(currentMonth, 'MMMM yyyy')}
                        </span>
                        <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                            <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="w-full">
                    <div className="grid grid-cols-7 mb-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                            <div key={i} className="text-center text-[10px] sm:text-xs font-bold text-gray-400 dark:text-slate-500">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {monthlyCalendar.map((day, i) => (
                            <button
                                key={i}
                                onClick={() => onDateClick?.(day.date)}
                                className={clsx(
                                    "min-h-[60px] rounded-lg flex flex-col items-start justify-start p-1.5 cursor-pointer transition-all relative overflow-hidden ring-1 ring-inset",
                                    !day.isCurrentMonth && "opacity-30 grayscale ring-transparent bg-gray-50/50 dark:bg-slate-800/50",
                                    day.isToday ? "ring-primary" : "ring-gray-100 dark:ring-slate-700 hover:ring-gray-300 dark:hover:ring-slate-500",
                                    !day.isToday && "bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-750"
                                )}
                            >
                                <span className={clsx(
                                    "text-xs font-medium mb-1",
                                    day.isToday ? "text-primary font-bold" : "text-gray-700 dark:text-gray-300"
                                )}>
                                    {format(day.date, 'd')}
                                </span>

                                <div className="w-full flex-1 flex flex-col gap-0.5 overflow-hidden">
                                    {day.hasTasks && day.tasks.slice(0, 3).map((task) => (
                                        <div key={task.id} className="flex items-center gap-1 min-w-0">
                                            <div className={clsx(
                                                "w-1 h-1 rounded-full flex-shrink-0",
                                                task.isCompleted ? "bg-green-400" : "bg-primary"
                                            )} />
                                            <span className={clsx(
                                                "text-[8px] leading-tight truncate text-left",
                                                task.isCompleted ? "text-gray-400 line-through" : "text-gray-600 dark:text-gray-300"
                                            )}>
                                                {task.title}
                                            </span>
                                        </div>
                                    ))}
                                    {day.tasks.length > 3 && (
                                        <span className="text-[8px] text-gray-400">+{day.tasks.length - 3}</span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col items-center justify-start min-h-screen p-2 sm:p-4 relative">
            {/* View Mode Toggle & Header */}
            {zoomedGrid === null && (
                <div className="w-full max-w-4xl mb-3 flex flex-col gap-3">
                    {/* View Mode Toggle */}
                    <div className="flex justify-center">
                        <div className="inline-flex bg-gray-100 dark:bg-slate-800 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode('mandalart')}
                                className={clsx(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                    viewMode === 'mandalart'
                                        ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                                        : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                                )}
                            >
                                <Hexagon className="w-4 h-4" />
                                <span>목표</span>
                            </button>
                            <button
                                onClick={() => setViewMode('achievement')}
                                className={clsx(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                    viewMode === 'achievement'
                                        ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                                        : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                                )}
                            >
                                <BarChart3 className="w-4 h-4" />
                                <span>성취도</span>
                            </button>
                        </div>
                    </div>

                    {/* Mandalart Header Actions */}
                    {viewMode === 'mandalart' && (
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => setHelpCenterOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 dark:text-slate-400 hover:text-primary transition-colors text-sm"
                            >
                                <HelpCircle className="w-4 h-4" />
                                <span className="hidden sm:inline">도움말</span>
                            </button>

                            <div className="flex items-center gap-3">
                                {/* Mini Progress Indicator */}
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-slate-800 rounded-full">
                                    <Target className="w-4 h-4 text-primary" />
                                    <div className="w-16 h-1.5 bg-gray-300 dark:bg-slate-600 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full transition-all duration-500"
                                            style={{ width: `${progressPercentage}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-gray-600 dark:text-slate-300">
                                        {progressPercentage}%
                                    </span>
                                </div>

                                {/* 맞춤 생성 버튼 */}
                                <button
                                    onClick={() => setWizardOpen(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all text-sm font-medium"
                                >
                                    <Wand2 className="w-4 h-4" />
                                    <span>맞춤 생성</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <AnimatePresence mode="wait">
                {/* Achievement View */}
                {viewMode === 'achievement' && zoomedGrid === null ? (
                    <motion.div
                        key="achievement"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="w-full"
                    >
                        {renderAchievementView()}
                    </motion.div>
                ) : zoomedGrid === null ? (
                    <motion.div
                        key="mandalart-grid"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="grid grid-cols-3 gap-1 sm:gap-2 w-full max-w-4xl aspect-square"
                    >
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(gridIndex => (
                            <div
                                key={gridIndex}
                                className="cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all rounded-lg overflow-hidden"
                                onClick={() => handleSubGoalGridClick(gridIndex)}
                            >
                                <MandalartGrid
                                    data={mandalartData[gridIndex]}
                                    gridIndex={gridIndex}
                                    isCenterGrid={gridIndex === 4}
                                    gridColor={GRID_COLORS[gridIndex]}
                                    subGoalProgress={gridIndex !== 4 ? getSubGoalProgress(gridIndex) : undefined}
                                    onUpdate={(cellIdx, val) => updateMandalartCell(gridIndex, cellIdx, val)}
                                />
                            </div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="w-full max-w-lg aspect-square relative mt-8"
                    >
                        <button
                            onClick={() => setZoomedGrid(null)}
                            className="absolute -top-10 left-0 flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-sm"
                        >
                            <ZoomOut className="w-4 h-4" />
                            전체 보기
                        </button>

                        {/* Category Color Indicator */}
                        {zoomedGrid !== 4 && (
                            <div
                                className="absolute -top-10 right-0 px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm"
                                style={{ backgroundColor: GRID_COLORS[zoomedGrid] || 'var(--color-primary)' }}
                            >
                                {mandalartData[zoomedGrid].title || `목표 ${zoomedGrid + 1}`}
                            </div>
                        )}

                        <div className="w-full h-full shadow-2xl rounded-xl overflow-hidden">
                            <MandalartGrid
                                data={mandalartData[zoomedGrid]}
                                gridIndex={zoomedGrid}
                                isCenterGrid={zoomedGrid === 4}
                                gridColor={GRID_COLORS[zoomedGrid]}
                                subGoalProgress={zoomedGrid !== 4 ? getSubGoalProgress(zoomedGrid) : undefined}
                                onUpdate={(cellIdx, val) => updateMandalartCell(zoomedGrid, cellIdx, val)}
                                onOpenTodos={(cellIdx) => handleOpenTodos(zoomedGrid, cellIdx)}
                                onIconClick={(cellIdx) => handleIconClick(zoomedGrid, cellIdx)}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Goal Todo Modal */}
            {selectedCell && (
                <GoalTodoModal
                    isOpen={todoModalOpen}
                    gridIndex={selectedCell.gridIndex}
                    cellIndex={selectedCell.cellIndex}
                    goalText={getSelectedCellData().goalText}
                    gridColor={getSelectedCellData().gridColor}
                    onClose={handleCloseTodoModal}
                />
            )}

            {/* Emoji Picker Modal */}
            <AnimatePresence>
                {emojiPickerOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setEmojiPickerOpen(false)}
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 flex flex-col gap-2"
                        >
                            {/* 자주 사용하는 이모지 빠른 선택 */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-slate-400 mb-2 font-medium">자주 사용하는 이모지</p>
                                <div className="flex flex-wrap gap-1">
                                    {['🎯', '💪', '📚', '💰', '❤️', '🌟', '🔥', '✨', '🏆', '💡', '🎨', '🎵', '✅', '📝', '💻', '🌎', '🏃', '🧘', '📈', '🎓', '💼', '🏠', '👨‍👩‍👧‍👦', '🙏', '😊', '🌱', '⭐', '🚀', '💎', '🌈'].map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => handleEmojiClick({ emoji } as EmojiClickData)}
                                            className="w-9 h-9 flex items-center justify-center text-xl hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="shadow-2xl rounded-xl overflow-hidden flex-1 sm:flex-none sm:h-[400px]">
                                <EmojiPicker
                                    onEmojiClick={handleEmojiClick}
                                    skinTonesDisabled={false}
                                    searchDisabled={false}
                                    searchPlaceholder="이모지 검색..."
                                    lazyLoadEmojis={true}
                                    width="100%"
                                    height="100%"
                                    emojiStyle={EmojiStyle.NATIVE}
                                    suggestedEmojisMode={SuggestionMode.RECENT}
                                    categories={[
                                        { category: Categories.SUGGESTED, name: '최근 사용' },
                                        { category: Categories.SMILEYS_PEOPLE, name: '표정 & 사람' },
                                        { category: Categories.ANIMALS_NATURE, name: '동물 & 자연' },
                                        { category: Categories.FOOD_DRINK, name: '음식 & 음료' },
                                        { category: Categories.TRAVEL_PLACES, name: '여행 & 장소' },
                                        { category: Categories.ACTIVITIES, name: '활동' },
                                        { category: Categories.OBJECTS, name: '사물' },
                                        { category: Categories.SYMBOLS, name: '기호' },
                                        { category: Categories.FLAGS, name: '깃발' },
                                    ]}
                                />
                            </div>
                            <button
                                onClick={handleRemoveIcon}
                                className="flex-shrink-0 w-full py-3 bg-white dark:bg-slate-800 text-red-500 font-medium rounded-xl shadow-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                아이콘 제거
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Wizard Modal */}
            <MandalartWizard
                isOpen={wizardOpen}
                onClose={() => setWizardOpen(false)}
                onComplete={handleWizardComplete}
                existingData={mandalartData}
            />

            {/* Help Center */}
            <MandalartHelpCenter
                isOpen={helpCenterOpen}
                onClose={() => setHelpCenterOpen(false)}
            />

            {/* SubGoal Input Modal (직접입력/AI추천 선택) */}
            {subGoalInputGridIndex !== null && (
                <SubGoalInputModal
                    isOpen={subGoalInputModalOpen}
                    gridIndex={subGoalInputGridIndex}
                    subGoalTheme={mandalartData[subGoalInputGridIndex]?.cells[4] || ''}
                    gridColor={GRID_COLORS[subGoalInputGridIndex] || ''}
                    onClose={() => {
                        setSubGoalInputModalOpen(false);
                        setSubGoalInputGridIndex(null);
                    }}
                    onManualInput={handleSubGoalInputManual}
                    onApplyRecommendation={handleSubGoalInputRecommendation}
                />
            )}

            {/* Motivational Toast */}
            <MotivationalToast
                quote={motivationalQuote}
                onClose={() => setMotivationalQuote(null)}
                actionLabel={toastAction?.label}
                onAction={toastAction?.action}
            />
        </div>
    );
};
