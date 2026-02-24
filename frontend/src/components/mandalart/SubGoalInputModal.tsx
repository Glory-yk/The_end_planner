import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PenLine, Sparkles, ArrowRight, Check } from 'lucide-react';
import { SUB_GOAL_TEMPLATES, SubGoalTemplate } from '@/data/mandalartTemplates';
import clsx from 'clsx';

interface SubGoalInputModalProps {
    isOpen: boolean;
    gridIndex: number;
    subGoalTheme: string; // 입력된 Sub-Goal 주제
    gridColor: string;
    onClose: () => void;
    onManualInput: () => void; // 직접 입력 선택 시
    onApplyRecommendation: (suggestions: string[]) => void; // 추천 항목 적용 시
}

export const SubGoalInputModal = ({
    isOpen,
    gridIndex,
    subGoalTheme,
    gridColor,
    onClose,
    onManualInput,
    onApplyRecommendation
}: SubGoalInputModalProps) => {
    const [step, setStep] = useState<'choose' | 'recommend'>('choose');
    const [selectedTemplate, setSelectedTemplate] = useState<SubGoalTemplate | null>(null);

    // Sub-Goal 주제에 맞는 추천 템플릿 찾기
    const getRecommendations = (): SubGoalTemplate[] => {
        // 모든 카테고리에서 추천 검색
        const allTemplates: SubGoalTemplate[] = [];
        Object.values(SUB_GOAL_TEMPLATES).forEach(templates => {
            allTemplates.push(...templates);
        });

        // 주제와 관련된 템플릿 필터링 (간단한 키워드 매칭)
        const themeLower = subGoalTheme.toLowerCase();
        const keywords = themeLower.split(/\s+/);

        // 매칭되는 템플릿 찾기
        const matched = allTemplates.filter(t => {
            const searchText = `${t.name} ${t.category} ${t.suggestions.join(' ')}`.toLowerCase();
            return keywords.some(kw => searchText.includes(kw));
        });

        // 매칭되는 게 없으면 전체 반환
        return matched.length > 0 ? matched.slice(0, 8) : allTemplates.slice(0, 8);
    };

    const recommendations = getRecommendations();

    const handleChooseManual = () => {
        onManualInput();
        handleClose();
    };

    const handleChooseRecommend = () => {
        setStep('recommend');
    };

    const handleSelectTemplate = (template: SubGoalTemplate) => {
        setSelectedTemplate(template);
    };

    const handleApply = () => {
        if (selectedTemplate) {
            onApplyRecommendation(selectedTemplate.suggestions);
            handleClose();
        }
    };

    const handleClose = () => {
        setStep('choose');
        setSelectedTemplate(null);
        onClose();
    };

    const handleBack = () => {
        setStep('choose');
        setSelectedTemplate(null);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div
                            className="flex-shrink-0 relative p-4 sm:p-6 text-white"
                            style={{ backgroundColor: gridColor || 'var(--color-primary)' }}
                        >
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="text-xl font-bold mb-1">
                                {step === 'choose' ? '세부 목표 입력 방법' : '추천 항목 선택'}
                            </h2>
                            <p className="text-sm opacity-90">
                                {subGoalTheme ? `"${subGoalTheme}" 관련 항목` : `목표 ${gridIndex + 1}`}
                            </p>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                            <AnimatePresence mode="wait">
                                {step === 'choose' ? (
                                    <motion.div
                                        key="choose"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-4"
                                    >
                                        <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">
                                            세부 목표(8칸)를 어떻게 채울까요?
                                        </p>

                                        {/* 직접 입력 */}
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleChooseManual}
                                            className="w-full p-5 rounded-xl border-2 border-gray-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all text-left flex items-center gap-4"
                                        >
                                            <div
                                                className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                                                style={{ backgroundColor: gridColor || 'var(--color-primary)' }}
                                            >
                                                <PenLine className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                                                    직접 입력
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-slate-400">
                                                    나만의 세부 목표를 직접 작성합니다
                                                </p>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-gray-400" />
                                        </motion.button>

                                        {/* AI 추천 */}
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleChooseRecommend}
                                            className="w-full p-5 rounded-xl border-2 border-gray-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all text-left flex items-center gap-4"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                                                <Sparkles className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                                                    AI 추천
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-slate-400">
                                                    {subGoalTheme
                                                        ? `"${subGoalTheme}" 주제에 맞는 항목 추천`
                                                        : '인기 있는 세부 목표 추천'}
                                                </p>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-gray-400" />
                                        </motion.button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="recommend"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-4"
                                    >
                                        <button
                                            onClick={handleBack}
                                            className="text-sm text-gray-600 dark:text-slate-400 hover:text-primary flex items-center gap-1 mb-4"
                                        >
                                            ← 돌아가기
                                        </button>

                                        <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                                            아래에서 원하는 세트를 선택하세요. 8개의 세부 목표가 자동으로 채워집니다.
                                        </p>

                                        {/* Recommendation Grid */}
                                        <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
                                            {recommendations.map((template) => {
                                                const isSelected = selectedTemplate?.id === template.id;
                                                return (
                                                    <motion.button
                                                        key={template.id}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => handleSelectTemplate(template)}
                                                        className={clsx(
                                                            "relative p-4 rounded-xl border-2 transition-all text-left",
                                                            isSelected
                                                                ? "border-primary bg-primary/10 shadow-lg"
                                                                : "border-gray-200 dark:border-slate-700 hover:border-primary/50"
                                                        )}
                                                    >
                                                        {isSelected && (
                                                            <div className="absolute top-2 right-2">
                                                                <Check className="w-5 h-5 text-primary" />
                                                            </div>
                                                        )}

                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-2xl">{template.icon}</span>
                                                            <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                                                {template.name}
                                                            </span>
                                                        </div>

                                                        <div className="space-y-1">
                                                            {template.suggestions.slice(0, 3).map((s, i) => (
                                                                <div
                                                                    key={i}
                                                                    className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400"
                                                                >
                                                                    <div className="w-1 h-1 rounded-full bg-gray-400" />
                                                                    {s}
                                                                </div>
                                                            ))}
                                                            {template.suggestions.length > 3 && (
                                                                <div className="text-xs text-gray-400">
                                                                    +{template.suggestions.length - 3}개 더
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.button>
                                                );
                                            })}
                                        </div>

                                        {/* Selected Preview */}
                                        {selectedTemplate && (
                                            <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                                                <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                                    선택된 세부 목표 미리보기
                                                </h4>
                                                <div className="grid grid-cols-4 gap-1">
                                                    {selectedTemplate.suggestions.map((s, i) => (
                                                        <div
                                                            key={i}
                                                            className="text-xs p-2 bg-white dark:bg-slate-600 rounded text-center truncate"
                                                            title={s}
                                                        >
                                                            {s}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        {step === 'recommend' && (
                            <div className="flex-shrink-0 flex justify-end p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
                                <button
                                    onClick={handleApply}
                                    disabled={!selectedTemplate}
                                    className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    적용하기
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
