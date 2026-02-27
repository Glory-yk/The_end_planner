import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { MANDALART_TEMPLATES, MandalartTemplate } from '@/data/mandalartTemplates';
import clsx from 'clsx';

interface MandalartTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTemplate: (template: MandalartTemplate) => void;
}

export const MandalartTemplateModal = ({ isOpen, onClose, onSelectTemplate }: MandalartTemplateModalProps) => {
    const handleTemplateClick = (template: MandalartTemplate) => {
        onSelectTemplate(template);
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
                        onClick={onClose}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-2xl sm:max-h-[80vh] bg-white dark:bg-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-6 h-6 text-primary" />
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        템플릿으로 시작하기
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                                        원하는 목표 템플릿을 선택하고 수정하세요
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                            </button>
                        </div>

                        {/* Template Grid */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {MANDALART_TEMPLATES.map((template) => (
                                    <motion.button
                                        key={template.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleTemplateClick(template)}
                                        className={clsx(
                                            "flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left",
                                            "hover:border-primary hover:bg-primary/5",
                                            "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50"
                                        )}
                                    >
                                        {/* Icon & Title */}
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-3xl">{template.icon}</span>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-900 dark:text-white">
                                                    {template.name}
                                                </h3>
                                                <span className="text-xs text-gray-500 dark:text-slate-400">
                                                    {template.category}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-sm text-gray-600 dark:text-slate-300 mb-3">
                                            {template.description}
                                        </p>

                                        {/* Preview */}
                                        <div className="w-full bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
                                            <div className="text-xs font-medium text-primary mb-2">
                                                중심 목표: {template.centerGoal}
                                            </div>
                                            <div className="grid grid-cols-2 gap-1">
                                                {template.subGoals.slice(0, 4).map((goal, i) => (
                                                    <div key={i} className="flex items-center gap-1">
                                                        <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-slate-500" />
                                                        <span className="text-[10px] text-gray-500 dark:text-slate-400 truncate">
                                                            {goal}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            {template.subGoals.length > 4 && (
                                                <div className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">
                                                    +{template.subGoals.length - 4} more...
                                                </div>
                                            )}
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
                            <p className="text-xs text-center text-gray-500 dark:text-slate-400">
                                💡 템플릿을 선택하면 언제든지 수정할 수 있어요
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
