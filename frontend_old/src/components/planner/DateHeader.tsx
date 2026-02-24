import { format, addDays, subDays, addWeeks, subWeeks, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { ViewMode } from './ViewToggle';
import { useTheme } from '@/contexts/ThemeContext';

interface DateHeaderProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    viewMode?: ViewMode;
    onSync?: () => void;
}

export const DateHeader = ({ selectedDate, onDateChange, viewMode = 'today', onSync }: DateHeaderProps) => {
    const { primaryColor } = useTheme();
    const isWeekMode = viewMode === 'week';

    const handlePrev = () => {
        if (isWeekMode) {
            onDateChange(subWeeks(selectedDate, 1));
        } else {
            onDateChange(subDays(selectedDate, 1));
        }
    };

    const handleNext = () => {
        if (isWeekMode) {
            onDateChange(addWeeks(selectedDate, 1));
        } else {
            onDateChange(addDays(selectedDate, 1));
        }
    };

    const handleToday = () => {
        onDateChange(new Date());
    };

    // Format display based on mode
    const getDisplayText = () => {
        if (isWeekMode) {
            const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
            const weekEnd = addDays(weekStart, 6);
            return {
                main: `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'd')}`,
                sub: format(weekStart, 'yyyy')
            };
        }
        return {
            main: format(selectedDate, 'MMM d'),
            sub: format(selectedDate, 'EEEE')
        };
    };

    const display = getDisplayText();

    return (
        <div className="flex items-center justify-between px-8 pt-10 pb-6">
            <div className="flex flex-col">
                <motion.span
                    key={display.sub}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ color: primaryColor }}
                    className="text-xs font-bold uppercase tracking-[0.2em] mb-1"
                >
                    {display.sub}
                </motion.span>
                <motion.h1
                    key={display.main}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-4xl font-bold text-gray-900 tracking-tight"
                >
                    {display.main}
                </motion.h1>
            </div>

            <div className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                {onSync && (
                    <button
                        onClick={onSync}
                        className="p-2 hover:bg-gray-50 text-gray-400 hover:text-primary rounded-lg transition-colors"
                        title="Sync with Google Calendar"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                )}
                <div className="w-px h-5 bg-gray-200 mx-1" />
                <button
                    onClick={handlePrev}
                    className="p-2 hover:bg-gray-50 text-gray-400 hover:text-primary rounded-lg transition-colors"
                    title={isWeekMode ? "Previous Week" : "Previous Day"}
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                    onClick={handleToday}
                    className="p-2 hover:bg-gray-50 text-gray-400 hover:text-primary rounded-lg transition-colors"
                    title="Today"
                >
                    <Calendar className="w-5 h-5" />
                </button>
                <button
                    onClick={handleNext}
                    className="p-2 hover:bg-gray-50 text-gray-400 hover:text-primary rounded-lg transition-colors"
                    title={isWeekMode ? "Next Week" : "Next Day"}
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
