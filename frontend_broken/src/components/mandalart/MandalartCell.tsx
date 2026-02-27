import { motion } from 'framer-motion';
import clsx from 'clsx';
// Add Smile icon import
import { ListTodo, Smile } from 'lucide-react';

interface MandalartCellProps {
    value: string;
    cellIndex: number;
    isCenter: boolean;
    isCore: boolean;
    gridColor?: string;
    progress: number;
    subGoalProgress?: number;
    todoCount?: number;
    icon?: string;              // Emoji icon
    onChange: (value: string) => void;
    onOpenTodos?: (() => void);
    onIconClick?: () => void;   // Trigger emoji picker
    isZoomed?: boolean;         // NEW: Controls edit mode visibility
}

export const MandalartCell = ({
    value,
    cellIndex: _cellIndex,
    isCenter,
    isCore,
    gridColor,
    progress,
    subGoalProgress,
    todoCount = 0,
    icon,
    onChange,
    onOpenTodos,
    onIconClick,
    isZoomed = false
}: MandalartCellProps) => {
    void _cellIndex;
    void progress;
    const hasContent = value.trim().length > 0;

    // Core Layout (Center of the 9x9) - Primary Brand Color (Solid)
    if (isCore) {
        return (
            <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative w-full h-full min-h-[60px] flex items-center justify-center p-1 rounded-xl bg-primary text-white shadow-md z-10"
            >
                <textarea
                    className="w-full h-full text-center bg-transparent resize-none outline-none flex items-center justify-center text-white font-bold text-[10px] sm:text-xs leading-3 placeholder:text-primary-100 placeholder:opacity-70 no-scrollbar"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="MAIN GOAL"
                    spellCheck={false}
                />
            </motion.div>
        );
    }

    // Sub-Core Layout (Center of each 3x3)
    if (isCenter) {
        const style = gridColor ? {
            backgroundColor: `${gridColor}26`,
            borderColor: `${gridColor}66`,
            color: gridColor
        } : undefined;

        const progressValue = subGoalProgress || 0;
        // In overview (!isZoomed) and has icon, show ONLY icon
        const showIconParamount = !isZoomed && icon;

        return (
            <motion.div
                whileHover={{ scale: 1.02 }}
                className={clsx(
                    "relative w-full h-full min-h-[60px] flex items-center justify-center p-1 rounded-xl border shadow-sm overflow-hidden group",
                    !gridColor && "bg-primary/10 dark:bg-primary/20 border-primary/20 dark:border-primary/30 text-primary"
                )}
                style={style}
            >
                {/* Progress Bar */}
                {progressValue > 0 && (
                    <div
                        className="absolute bottom-0 left-0 h-1 transition-all duration-500"
                        style={{
                            width: `${progressValue}%`,
                            backgroundColor: gridColor || 'var(--color-primary)'
                        }}
                    />
                )}

                {/* Display Icon (Large in Overview) */}
                {showIconParamount ? (
                    <div className="text-3xl sm:text-4xl select-none animate-in zoom-in duration-300">
                        {icon}
                    </div>
                ) : (
                    <textarea
                        className={clsx(
                            "w-full h-full text-center bg-transparent resize-none outline-none flex items-center justify-center font-bold text-xs sm:text-sm placeholder:opacity-50 no-scrollbar pt-2", // Added pt-2 for icon space
                            !gridColor && "text-primary placeholder:text-primary/50"
                        )}
                        style={gridColor ? { color: gridColor } : {}}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Sub Goal"
                        spellCheck={false}
                    />
                )}

                {/* Emoji Picker Button - Consistent Style */}
                {onIconClick && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onIconClick();
                        }}
                        className="absolute top-1 left-1 p-1 rounded-full text-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-30"
                        style={{ backgroundColor: gridColor || 'var(--color-primary)' }}
                        title="아이콘 변경"
                    >
                        {icon ? (
                            <span className="text-xs leading-none filter drop-shadow-sm">{icon}</span>
                        ) : (
                            <Smile className="w-3 h-3" />
                        )}
                    </button>
                )}

                {/* Progress Badge */}
                {progressValue > 0 && (
                    <div
                        className="absolute bottom-1 right-1 text-[8px] font-medium opacity-80"
                        style={{ color: gridColor || 'var(--color-primary)' }}
                    >
                        {Math.round(progressValue)}%
                    </div>
                )}
            </motion.div>
        );
    }

    // Leaf Layout (Outer cells) - Theme Tint
    const showTint = gridColor && !isCore;
    const tintOpacity = hasContent
        ? "opacity-20 dark:opacity-30"
        : "opacity-5 dark:opacity-10";
    const borderStyle = (showTint && hasContent) ? { borderColor: `${gridColor}4D` } : undefined;

    return (
        <motion.div
            whileHover={{ y: -2 }}
            style={borderStyle}
            className={clsx(
                "relative w-full h-full min-h-[60px] flex items-center justify-center p-1 rounded-lg transition-all duration-200 group overflow-hidden",
                "bg-white dark:bg-slate-800 border shadow-sm",
                !borderStyle && "border-gray-100 dark:border-slate-600",
                "hover:border-primary/50 hover:shadow-md"
            )}
        >
            {/* Tint Layer */}
            {showTint && (
                <div
                    className={clsx("absolute inset-0 pointer-events-none transition-opacity duration-300", tintOpacity)}
                    style={{ backgroundColor: gridColor }}
                />
            )}

            {/* Content: Icon or Textarea */}
            {!isZoomed && icon ? (
                <div className="text-2xl sm:text-3xl select-none animate-in zoom-in duration-300 z-10">
                    {icon}
                </div>
            ) : (
                <textarea
                    className={clsx(
                        "w-full h-full text-center bg-transparent resize-none outline-none flex items-center justify-center text-[10px] sm:text-xs font-medium text-gray-700 dark:text-slate-200 z-10 relative no-scrollbar pt-3", // Added padding top for icon button space
                        "placeholder:text-gray-300 dark:placeholder:text-slate-600 transition-colors focus:text-gray-900 dark:focus:text-white",
                        "focus:ring-1 focus:rounded-md focus:bg-white dark:focus:bg-slate-800",
                        !gridColor && "focus:ring-primary"
                    )}
                    style={gridColor ? { '--tw-ring-color': gridColor } as any : {}}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="클릭하여 작성..."
                    spellCheck={false}
                />
            )}

            {/* Emoji Picker Button (Top-Left) */}
            {onIconClick && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onIconClick();
                    }}
                    className="absolute top-1 left-1 p-1 rounded-full text-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-30"
                    style={{ backgroundColor: gridColor || 'var(--color-primary)' }}
                    title="아이콘 변경"
                >
                    {icon ? (
                        <span className="text-xs leading-none filter drop-shadow-sm">{icon}</span>
                    ) : (
                        <Smile className="w-3 h-3" />
                    )}
                </button>
            )}

            {/* Todo count badge (Bottom-Left) */}
            {todoCount > 0 && (
                <div
                    className="absolute bottom-1 left-1 text-[8px] font-medium px-1 rounded z-20"
                    style={{
                        backgroundColor: `${gridColor || '#6b7280'}20`,
                        color: gridColor || '#6b7280'
                    }}
                >
                    {todoCount}
                </div>
            )}

            {/* Hover Actions: Open Todos (Top-Right) */}
            {onOpenTodos && hasContent && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={onOpenTodos}
                    className="absolute top-1 right-1 p-1 rounded-full text-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-20"
                    style={{ backgroundColor: gridColor || 'var(--color-primary)' }}
                    title="할 일 목록"
                >
                    <ListTodo className="w-3 h-3" />
                </motion.button>
            )}
        </motion.div>
    );
};
