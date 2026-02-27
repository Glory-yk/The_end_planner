import { startOfWeek, addDays, format, isSameDay } from 'date-fns';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useTheme } from '@/contexts/ThemeContext';

interface WeekCalendarProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
}

export const WeekCalendar = ({ selectedDate, onDateSelect }: WeekCalendarProps) => {
    const { primaryColor } = useTheme();
    const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Start on Monday
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

    return (
        <div className="flex justify-between px-4 pb-6 overflow-x-auto no-scrollbar">
            {weekDays.map((date, index) => {
                const isSelected = isSameDay(date, selectedDate);
                const isToday = isSameDay(date, new Date());

                return (
                    <motion.button
                        key={date.toISOString()}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => onDateSelect(date)}
                        className={clsx(
                            "flex flex-col items-center justify-center min-w-[3rem] py-3 rounded-2xl transition-all duration-300",
                            isSelected
                                ? "text-white shadow-lg scale-105"
                                : "hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400"
                        )}
                        style={{ backgroundColor: isSelected ? primaryColor : undefined }}
                    >
                        <span className={clsx(
                            "text-xs font-medium mb-1",
                            isSelected ? "text-white/80" : "text-gray-400"
                        )}>
                            {format(date, 'EEE')}
                        </span>
                        <span className={clsx(
                            "text-lg font-bold",
                            isToday && !isSelected && "text-blue-600"
                        )}>
                            {format(date, 'd')}
                        </span>
                        {isToday && (
                            <span className={clsx(
                                "w-1 h-1 rounded-full mt-1",
                                isSelected ? "bg-white" : "bg-blue-600"
                            )} />
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
};
