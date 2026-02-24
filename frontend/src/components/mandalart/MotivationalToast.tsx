import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import { MotivationalQuote } from '@/data/motivationalQuotes';

interface MotivationalToastProps {
    quote: MotivationalQuote | null;
    onClose: () => void;
    duration?: number;
    actionLabel?: string;
    onAction?: () => void;
}

export const MotivationalToast = ({ quote, onClose, duration = 5000, actionLabel, onAction }: MotivationalToastProps) => {
    useEffect(() => {
        if (quote) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [quote, onClose, duration]);

    return (
        <AnimatePresence>
            {quote && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
                >
                    <div className="bg-gradient-to-r from-primary to-primary/90 text-white rounded-2xl shadow-2xl p-4 relative overflow-hidden">
                        {/* Decorative background */}
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

                        {/* Content */}
                        <div className="relative flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <Sparkles className="w-6 h-6 animate-pulse" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium leading-relaxed">
                                    {quote.text}
                                </p>
                                {quote.author && (
                                    <p className="text-xs opacity-80 mt-1">
                                        - {quote.author}
                                    </p>
                                )}

                                {actionLabel && onAction && (
                                    <button
                                        onClick={onAction}
                                        className="mt-3 px-4 py-1.5 bg-white text-primary rounded-lg text-xs font-bold hover:bg-white/90 transition-colors shadow-sm"
                                    >
                                        {actionLabel}
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={onClose}
                                className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Progress bar */}
                        <motion.div
                            initial={{ width: '100%' }}
                            animate={{ width: '0%' }}
                            transition={{ duration: duration / 1000, ease: 'linear' }}
                            className="absolute bottom-0 left-0 h-1 bg-white/30"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
