import { motion } from 'framer-motion';
import { Task } from '@/types/task';
import { useTheme } from '@/contexts/ThemeContext';

interface ProgressIndicatorProps {
    tasks: Task[];
}

export const ProgressIndicator = ({ tasks }: ProgressIndicatorProps) => {
    const { primaryColor } = useTheme();
    const total = tasks.length;
    const completed = tasks.filter(t => t.isCompleted).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    return (
        <div className="px-6 mb-6">
            <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
                <span>Daily Progress</span>
                <span>{percentage}%</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: primaryColor }}
                />
            </div>
        </div>
    );
};
