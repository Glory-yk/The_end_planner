import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check } from 'lucide-react';
import clsx from 'clsx';

interface MandalartWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (result: WizardResult) => void;
}

export interface WizardResult {
    selectedCategories: string[];
}

// 8개 카테고리 (Main Goal 주변 8칸에 배치될 Sub-Goal 카테고리)
const CATEGORIES = [
    { value: 'health', label: '건강 & 운동', icon: '💪', color: '#ef4444', description: '신체 건강, 운동, 식습관' },
    { value: 'study', label: '학습 & 성장', icon: '📚', color: '#f97316', description: '공부, 자기계발, 독서' },
    { value: 'english', label: '영어 & 어학', icon: '🌎', color: '#eab308', description: '영어, 외국어 학습' },
    { value: 'career', label: '커리어', icon: '💼', color: '#22c55e', description: '직장, 승진, 전문성' },
    { value: 'finance', label: '재정 관리', icon: '💰', color: '#06b6d4', description: '저축, 투자, 부업' },
    { value: 'habit', label: '좋은 습관', icon: '🎯', color: '#3b82f6', description: '루틴, 명상, 생활 패턴' },
    { value: 'relationship', label: '관계 & 소통', icon: '❤️', color: '#a855f7', description: '가족, 친구, 네트워킹' },
    { value: 'coding', label: '개발 & 기술', icon: '💻', color: '#ec4899', description: '코딩, 프로젝트, 기술 스택' }
];

export const MandalartWizard = ({ isOpen, onClose, onComplete }: MandalartWizardProps) => {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const handleToggleCategory = (value: string) => {
        setSelectedCategories(prev => {
            if (prev.includes(value)) {
                return prev.filter(v => v !== value);
            }
            // 최대 8개까지 선택 가능
            if (prev.length >= 8) {
                return prev;
            }
            return [...prev, value];
        });
    };

    const handleComplete = () => {
        if (selectedCategories.length === 0) return;
        onComplete({ selectedCategories });
        handleClose();
    };

    const handleClose = () => {
        setSelectedCategories([]);
        onClose();
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
                        className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-2xl sm:max-h-[90vh] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex-shrink-0 relative bg-gradient-to-r from-primary to-primary/80 p-4 sm:p-6 text-white">
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3 mb-2">
                                <Sparkles className="w-6 h-6" />
                                <h2 className="text-xl font-bold">맞춤 목표 생성</h2>
                            </div>
                            <p className="text-sm opacity-90">
                                중심 목표 주변에 배치할 카테고리를 선택하세요 (최대 8개)
                            </p>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    카테고리 선택
                                </h3>
                                <span className="text-sm text-gray-500 dark:text-slate-400">
                                    {selectedCategories.length}/8 선택됨
                                </span>
                            </div>

                            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
                                원하는 분야를 여러 개 선택하면, 메인 목표 주변 8칸에 순서대로 배치됩니다.
                            </p>

                            {/* Category Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {CATEGORIES.map((category) => {
                                    const isSelected = selectedCategories.includes(category.value);
                                    const selectionOrder = selectedCategories.indexOf(category.value) + 1;

                                    return (
                                        <motion.button
                                            key={category.value}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleToggleCategory(category.value)}
                                            className={clsx(
                                                "relative p-4 rounded-xl border-2 transition-all text-left",
                                                isSelected
                                                    ? "border-primary bg-primary/10 shadow-lg"
                                                    : "border-gray-200 dark:border-slate-700 hover:border-primary/50 bg-white dark:bg-slate-800/50"
                                            )}
                                        >
                                            {/* Selection Badge */}
                                            {isSelected && (
                                                <div
                                                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md"
                                                    style={{ backgroundColor: category.color }}
                                                >
                                                    {selectionOrder}
                                                </div>
                                            )}

                                            {/* Check Mark */}
                                            {isSelected && (
                                                <div className="absolute top-2 right-2">
                                                    <Check className="w-4 h-4 text-primary" />
                                                </div>
                                            )}

                                            <div className="text-3xl mb-2">{category.icon}</div>
                                            <div className="font-semibold text-sm text-gray-900 dark:text-white">
                                                {category.label}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                                                {category.description}
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* Selection Preview */}
                            {selectedCategories.length > 0 && (
                                <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
                                        배치 순서 미리보기
                                    </h4>
                                    <div className="grid grid-cols-3 gap-1 w-32 mx-auto">
                                        {[0, 1, 2, 3, -1, 5, 6, 7, 8].map((pos) => {
                                            if (pos === -1) {
                                                // Center cell (Main Goal)
                                                return (
                                                    <div
                                                        key="center"
                                                        className="w-10 h-10 rounded-md bg-primary flex items-center justify-center text-white text-xs font-bold"
                                                    >
                                                        🎯
                                                    </div>
                                                );
                                            }
                                            const gridIndex = pos < 4 ? pos : pos - 1;
                                            const category = CATEGORIES.find(c => c.value === selectedCategories[gridIndex]);
                                            return (
                                                <div
                                                    key={pos}
                                                    className={clsx(
                                                        "w-10 h-10 rounded-md flex items-center justify-center text-lg",
                                                        category
                                                            ? "bg-white dark:bg-slate-600 shadow-sm"
                                                            : "bg-gray-200 dark:bg-slate-600/50"
                                                    )}
                                                    style={category ? { borderColor: category.color, borderWidth: 2 } : {}}
                                                >
                                                    {category?.icon || ''}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex-shrink-0 flex justify-between p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                취소
                            </button>

                            <button
                                onClick={handleComplete}
                                disabled={selectedCategories.length === 0}
                                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                            >
                                <Sparkles className="w-4 h-4" />
                                {selectedCategories.length}개 카테고리 적용
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// Export categories for external use
export { CATEGORIES };
