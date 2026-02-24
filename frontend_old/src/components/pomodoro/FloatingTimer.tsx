import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RefreshCw, X, Square, Timer } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

interface FloatingTimerProps {
    // Pomodoro mode props
    timeLeft: number;
    isActive: boolean;
    sessionType: 'FOCUS' | 'BREAK';
    toggleTimer: () => void;
    resetTimer: () => void;
    formatTime: (seconds: number) => string;
    onStartQuickFocus?: () => void; // New prop for quick focus

    // Task timer mode props
    timerMode: 'pomodoro' | 'task';
    currentTaskId: string | null;
    currentTaskTitle: string;
    formatElapsedTime: () => string;
    elapsedMinutes: number;
    stopTaskTimer: () => number;
    cancelTaskTimer: () => void;
}

export const FloatingTimer = ({
    timeLeft,
    isActive,
    sessionType,
    toggleTimer,
    resetTimer,
    formatTime,
    onStartQuickFocus,
    timerMode,
    currentTaskId,
    currentTaskTitle,
    formatElapsedTime,
    elapsedMinutes,
    stopTaskTimer,
    cancelTaskTimer
}: FloatingTimerProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // 태스크 타이머가 활성화되면 자동으로 확장
    const shouldAutoExpand = timerMode === 'task'; // Always expand for any task timer

    const handleStopTask = () => {
        stopTaskTimer();
    };

    const handleCancelTask = () => {
        cancelTaskTimer();
    };

    return (
        <motion.div
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.1}
            className="fixed bottom-40 right-6 z-50 pointer-events-auto"
        >
            <AnimatePresence mode="wait">
                {/* Task Timer Mode */}
                {timerMode === 'task' ? (
                    <motion.div
                        key="task-timer"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl shadow-2xl overflow-hidden border border-green-400/30"
                    >
                        <div className="p-5 min-w-[280px]">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2">
                                    <Timer className="w-4 h-4 animate-pulse" />
                                    <span className="text-xs font-bold tracking-wider px-2 py-1 rounded bg-white/20">
                                        진행 중
                                    </span>
                                </div>
                                <button
                                    onClick={handleCancelTask}
                                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                    title="취소"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Task Title */}
                            <div className="text-sm font-medium text-white/90 mb-2 truncate max-w-[250px]">
                                {currentTaskId ? currentTaskTitle : "집중하는 중..."}
                            </div>

                            {/* Elapsed Time Display */}
                            <div className="text-5xl font-mono font-bold text-center mb-2 tracking-tight">
                                {formatElapsedTime()}
                            </div>

                            {/* Elapsed Minutes */}
                            <div className="text-center text-sm text-white/70 mb-4">
                                {elapsedMinutes > 0 ? `${elapsedMinutes}분 경과` : '시작됨'}
                            </div>

                            {/* Stop Button */}
                            <button
                                onClick={handleStopTask}
                                className="w-full py-3 rounded-xl bg-white text-green-600 font-bold flex items-center justify-center gap-2 hover:bg-green-50 transition-colors active:scale-95"
                            >
                                <Square className="w-5 h-5 fill-current" />
                                종료하고 기록
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    /* Pomodoro Mode */
                    <motion.div
                        key="pomodoro-timer"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={clsx(
                            "bg-black text-white rounded-2xl shadow-2xl transition-all overflow-hidden border border-gray-800",
                            isExpanded || shouldAutoExpand ? "w-64" : "w-16 h-16 rounded-full flex items-center justify-center cursor-pointer"
                        )}
                    >
                        {/* Minimized View */}
                        {!isExpanded && !shouldAutoExpand && (
                            <div onClick={() => setIsExpanded(true)} className="flex flex-col items-center">
                                <span className="text-xs font-bold">{Math.floor(timeLeft / 60)}</span>
                                <span className="text-[10px] opacity-70">min</span>
                            </div>
                        )}

                        {/* Expanded View */}
                        {(isExpanded || shouldAutoExpand) && (
                            <div className="p-5">
                                <div className="flex justify-between items-center mb-4">
                                    <span className={clsx(
                                        "text-xs font-bold tracking-wider px-2 py-1 rounded",
                                        sessionType === 'FOCUS' ? "bg-blue-600" : "bg-green-600"
                                    )}>
                                        {sessionType}
                                    </span>
                                    <button
                                        onClick={() => setIsExpanded(false)}
                                        className="p-1 hover:bg-gray-800 rounded-full"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>

                                <div className="text-5xl font-mono font-bold text-center mb-6 tracking-tight">
                                    {formatTime(timeLeft)}
                                </div>

                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={toggleTimer}
                                        className={clsx(
                                            "p-3 rounded-full transition-all active:scale-95",
                                            isActive ? "bg-gray-800 hover:bg-gray-700" : "bg-white text-black hover:bg-gray-200"
                                        )}
                                    >
                                        {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                                    </button>

                                    <button
                                        onClick={resetTimer}
                                        className="p-3 rounded-full bg-gray-900 hover:bg-gray-800 transition-all"
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Quick Focus Button */}
                                <div className="mt-4 pt-4 border-t border-gray-800">
                                    <button
                                        onClick={onStartQuickFocus}
                                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Timer className="w-4 h-4" />
                                        지금 바로 집중하기
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
