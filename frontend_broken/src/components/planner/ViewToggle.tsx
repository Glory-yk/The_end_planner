import { motion } from 'framer-motion';
import { Calendar, CalendarDays, CalendarRange } from 'lucide-react';
import clsx from 'clsx';
import { useTheme } from '@/contexts/ThemeContext';

export type ViewMode = 'today' | 'week' | 'month';

interface ViewToggleProps {
    mode: ViewMode;
    onChange: (mode: ViewMode) => void;
}

export const ViewToggle = ({ mode, onChange }: ViewToggleProps) => {
    const { primaryColor } = useTheme();
    const modes: { key: ViewMode; icon: React.ReactNode; label: string }[] = [
        { key: 'today', icon: <Calendar className="w-4 h-4" />, label: 'Today' },
        { key: 'week', icon: <CalendarDays className="w-4 h-4" />, label: 'Week' },
        { key: 'month', icon: <CalendarRange className="w-4 h-4" />, label: 'Month' },
    ];

    const activeIndex = modes.findIndex(m => m.key === mode);

    return (
        <div className="px-6 mb-6">
            <div className="bg-gray-100 dark:bg-slate-800 p-1 rounded-xl flex relative">
                {modes.map((m) => (
                    <button
                        key={m.key}
                        onClick={() => onChange(m.key)}
                        className={clsx(
                            "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all z-10",
                            mode === m.key ? "text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        )}
                    >
                        {m.icon}
                        {m.label}
                    </button>
                ))}

                {/* Sliding Background */}
                <motion.div
                    className="absolute top-1 bottom-1 left-1 rounded-lg shadow-sm"
                    style={{ width: `calc(${100 / 3}% - 4px)`, backgroundColor: primaryColor }}
                    animate={{ x: `calc(${activeIndex * 100}% + ${activeIndex * 4}px)` }}
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            </div>
        </div>
    );
};

