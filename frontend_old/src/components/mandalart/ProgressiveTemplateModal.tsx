import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, CheckCircle, Sparkles, Lightbulb, RefreshCw } from 'lucide-react';
import { MAIN_GOAL_TEMPLATES, SUB_GOAL_TEMPLATES, MainGoalTemplate, SubGoalTemplate } from '@/data/mandalartTemplates';
import { MandalartGridData } from '@/types/mandalart';
import clsx from 'clsx';

interface ProgressiveTemplateModalProps {
    isOpen: boolean;
    mandalartData: MandalartGridData[];
    onClose: () => void;
    onApplyMainGoal: (centerGoal: string) => void;
    onApplySubGoal: (gridIndex: number, subGoalName: string) => void;
    onApplySubGoalDetails: (gridIndex: number, suggestions: string[]) => void;
}

type Step = 'main' | 'category-select' | 'sub-overview' | 'sub-detail';

export const ProgressiveTemplateModal = ({
    isOpen,
    mandalartData,
    onClose,
    onApplyMainGoal,
    onApplySubGoal,
    onApplySubGoalDetails
}: ProgressiveTemplateModalProps) => {
    const [step, setStep] = useState<Step>('main');
    const [selectedMainGoal, setSelectedMainGoal] = useState<MainGoalTemplate | null>(null);
    const [selectedSubGoalGrid, setSelectedSubGoalGrid] = useState<number | null>(null);

    // Check current progress
    const currentMainGoal = mandalartData[4]?.cells[4]?.trim();
    const hasMainGoal = !!currentMainGoal;
    const filledSubGoals = [0, 1, 2, 3, 5, 6, 7, 8].filter(i =>
        mandalartData[i]?.cells[4]?.trim().length > 0
    );

    useEffect(() => {
        if (isOpen) {
            // Auto-determine step based on progress
            if (!hasMainGoal) {
                setStep('main');
                setSelectedMainGoal(null);
            } else {
                // Try to infer category if not selected
                if (!selectedMainGoal) {
                    const matched = MAIN_GOAL_TEMPLATES.find(t => t.centerGoal === currentMainGoal);
                    if (matched) {
                        setSelectedMainGoal(matched);
                        setStep('sub-overview');
                    } else {
                        // Category unknown or custom goal -> Ask for category
                        setStep('category-select');
                    }
                } else {
                    // Category already selected
                    setStep(selectedSubGoalGrid !== null ? 'sub-detail' : 'sub-overview');
                }
            }
        }
    }, [isOpen]);

    const handleMainGoalSelect = (template: MainGoalTemplate) => {
        setSelectedMainGoal(template);
        onApplyMainGoal(template.centerGoal);
        setStep('sub-overview');
    };

    const handleCategorySelect = (template: MainGoalTemplate) => {
        setSelectedMainGoal(template);
        // Do NOT overwrite main goal, just set category context
        setStep('sub-overview');
    };

    const handleSubGoalClick = (gridIndex: number) => {
        setSelectedSubGoalGrid(gridIndex);
        setStep('sub-detail');
    };

    const handleSubGoalSelect = (template: SubGoalTemplate, gridIndex: number) => {
        onApplySubGoal(gridIndex, template.name);
        onApplySubGoalDetails(gridIndex, template.suggestions);
        setSelectedSubGoalGrid(null);

        // Return to overview
        setStep('sub-overview');
    };

    const handleReset = () => {
        // Allow user to reset category or main goal
        if (step === 'sub-overview' || step === 'sub-detail') {
            setStep('main');
            setSelectedMainGoal(null);
            setSelectedSubGoalGrid(null);
        }
    };

    const getCurrentCategory = () => {
        return selectedMainGoal?.id || 'health';
    };

    const availableSubGoals = SUB_GOAL_TEMPLATES[getCurrentCategory()] || [];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-3xl sm:max-h-[85vh] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white relative">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center justify-between mr-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <Sparkles className="w-6 h-6" />
                                    <h2 className="text-xl font-bold">
                                        {step === 'main' && '중심 목표 선택'}
                                        {step === 'category-select' && '카테고리 설정'}
                                        {step === 'sub-overview' && '세부 목표 선택'}
                                        {step === 'sub-detail' && '세부 항목 추천'}
                                    </h2>
                                </div>
                                {(step === 'sub-overview' || step === 'sub-detail') && (
                                    <button
                                        onClick={handleReset}
                                        className="text-white/80 hover:text-white text-xs flex items-center gap-1 underline"
                                    >
                                        <RefreshCw className="w-3 h-3" />
                                        처음부터 다시
                                    </button>
                                )}
                            </div>

                            {/* Progress Indicator */}
                            <div className="flex items-center gap-2 text-sm opacity-90">
                                <CheckCircle className={clsx("w-4 h-4", (hasMainGoal || selectedMainGoal) && "fill-current")} />
                                <span>중심 목표</span>
                                <ArrowRight className="w-4 h-4" />
                                <CheckCircle className={clsx("w-4 h-4", filledSubGoals.length > 0 && "fill-current")} />
                                <span>세부 목표 ({filledSubGoals.length}/8)</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <AnimatePresence mode="wait">
                                {step === 'main' && (
                                    <MainGoalStep
                                        key="main"
                                        templates={MAIN_GOAL_TEMPLATES}
                                        onSelect={handleMainGoalSelect}
                                        currentGoal={currentMainGoal}
                                    />
                                )}

                                {step === 'category-select' && (
                                    <CategorySelectStep
                                        key="category"
                                        templates={MAIN_GOAL_TEMPLATES}
                                        onSelect={handleCategorySelect}
                                        currentGoal={currentMainGoal}
                                    />
                                )}

                                {step === 'sub-overview' && (
                                    <SubGoalOverviewStep
                                        key="sub-overview"
                                        mandalartData={mandalartData}
                                        onGridClick={handleSubGoalClick}
                                        filledCount={filledSubGoals.length}
                                    />
                                )}

                                {step === 'sub-detail' && selectedSubGoalGrid !== null && (
                                    <SubGoalDetailStep
                                        key="sub-detail"
                                        gridIndex={selectedSubGoalGrid}
                                        templates={availableSubGoals}
                                        currentValue={mandalartData[selectedSubGoalGrid]?.cells[4]}
                                        onSelect={(template) => handleSubGoalSelect(template, selectedSubGoalGrid)}
                                        onBack={() => {
                                            setSelectedSubGoalGrid(null);
                                            setStep('sub-overview');
                                        }}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// Step Components
const MainGoalStep = ({ templates, onSelect, currentGoal }: {
    templates: MainGoalTemplate[];
    onSelect: (template: MainGoalTemplate) => void;
    currentGoal?: string;
}) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="space-y-4"
    >
        {currentGoal && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    현재 중심 목표: <strong>{currentGoal}</strong>
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                    아래 템플릿을 선택하면 중심 목표가 변경됩니다.
                </p>
            </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {templates.map((template) => (
                <motion.button
                    key={template.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelect(template)}
                    className="flex flex-col items-center p-4 rounded-xl border-2 border-gray-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all"
                >
                    <span className="text-4xl mb-2">{template.icon}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white text-center">
                        {template.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                        {template.category}
                    </span>
                </motion.button>
            ))}
        </div>
    </motion.div>
);

const CategorySelectStep = ({ templates, onSelect, currentGoal }: {
    templates: MainGoalTemplate[];
    onSelect: (template: MainGoalTemplate) => void;
    currentGoal?: string;
}) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="space-y-4"
    >
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
            <h3 className="font-bold text-lg text-purple-900 dark:text-purple-100 mb-1">
                카테고리 설정
            </h3>
            <p className="text-sm text-purple-800 dark:text-purple-200">
                현재 목표 <strong>"{currentGoal}"</strong>에 맞는 추천을 받기 위해 카테고리를 선택해주세요.
            </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {templates.map((template) => (
                <motion.button
                    key={template.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelect(template)}
                    className="flex flex-col items-center p-4 rounded-xl border-2 border-gray-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all"
                >
                    <span className="text-4xl mb-2">{template.icon}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white text-center">
                        {template.category}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                        추천 보기
                    </span>
                </motion.button>
            ))}
        </div>
    </motion.div>
);

const SubGoalOverviewStep = ({ mandalartData, onGridClick, filledCount }: {
    mandalartData: MandalartGridData[];
    onGridClick: (gridIndex: number) => void;
    filledCount: number;
}) => {
    const gridIndices = [0, 1, 2, 3, 5, 6, 7, 8];

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
        >
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-xl border border-primary/20">
                <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
                    💡 각 칸을 클릭하여 세부 목표를 추가하세요 ({filledCount}/8 완료)
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {gridIndices.map((gridIndex) => {
                    const currentValue = mandalartData[gridIndex]?.cells[4];
                    const isFilled = currentValue?.trim().length > 0;

                    return (
                        <motion.button
                            key={gridIndex}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onGridClick(gridIndex)}
                            className={clsx(
                                "relative p-6 rounded-xl border-2 transition-all min-h-[100px] flex flex-col items-center justify-center",
                                isFilled
                                    ? "border-green-400 bg-green-50 dark:bg-green-900/20"
                                    : "border-dashed border-gray-300 dark:border-slate-600 hover:border-primary hover:bg-primary/5"
                            )}
                        >
                            {isFilled && (
                                <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-green-600 fill-current" />
                            )}

                            {isFilled ? (
                                <>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white text-center break-keep">
                                        {currentValue}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-8 h-8 text-gray-400 dark:text-slate-500 mb-2" />
                                    <span className="text-xs text-gray-500 dark:text-slate-400">
                                        목표 {gridIndex > 4 ? gridIndex : gridIndex + 1}
                                    </span>
                                </>
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </motion.div>
    );
};

const SubGoalDetailStep = ({ gridIndex: _gridIndex, templates, currentValue, onSelect, onBack }: {
    gridIndex: number;
    templates: SubGoalTemplate[];
    currentValue?: string;
    onSelect: (template: SubGoalTemplate) => void;
    onBack: () => void;
}) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="space-y-4"
    >
        <button
            onClick={onBack}
            className="text-sm text-gray-600 dark:text-slate-400 hover:text-primary flex items-center gap-1"
        >
            ← 돌아가기
        </button>

        {currentValue && (
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-800 dark:text-purple-200">
                    현재 목표: <strong>{currentValue}</strong>
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-300 mt-1">
                    이 목표를 위한 실행 계획을 선택하세요.
                </p>
            </div>
        )}

        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
            추천 세부 목표
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {templates.map((template) => (
                <motion.button
                    key={template.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect(template)}
                    className="p-4 rounded-xl border-2 border-gray-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all text-left"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{template.icon}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {template.name}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1">
                        {template.suggestions.slice(0, 4).map((suggestion, i) => (
                            <div key={i} className="flex items-center gap-1 text-xs text-gray-600 dark:text-slate-300">
                                <div className="w-1 h-1 rounded-full bg-primary" />
                                {suggestion}
                            </div>
                        ))}
                    </div>
                </motion.button>
            ))}
        </div>
    </motion.div>
);
