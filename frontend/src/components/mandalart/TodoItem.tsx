import { motion } from 'framer-motion';
import { Check, Calendar, Trash2, CheckCircle } from 'lucide-react';
import { Todo } from '@/types/todo';
import clsx from 'clsx';

interface TodoItemProps {
  todo: Todo;
  gridColor?: string;
  onToggle: () => void;
  onDelete: () => void;
  onConvert: () => void;
  isConverted: boolean;
}

export const TodoItem = ({
  todo,
  gridColor = '#6b7280',
  onToggle,
  onDelete,
  onConvert,
  isConverted
}: TodoItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={clsx(
        "flex items-center gap-3 p-3 rounded-lg transition-colors",
        todo.isCompleted
          ? "bg-gray-100 dark:bg-slate-700/50"
          : "bg-white dark:bg-slate-800 shadow-sm"
      )}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={clsx(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0",
          todo.isCompleted
            ? "border-green-500 bg-green-500"
            : "border-gray-300 dark:border-slate-500 hover:border-gray-400"
        )}
        style={todo.isCompleted ? {} : { borderColor: gridColor }}
      >
        {todo.isCompleted && <Check className="w-3 h-3 text-white" />}
      </button>

      {/* Todo Text */}
      <span
        className={clsx(
          "flex-1 text-sm transition-colors",
          todo.isCompleted
            ? "text-gray-400 dark:text-slate-500 line-through"
            : "text-gray-700 dark:text-slate-200"
        )}
      >
        {todo.text}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Convert to Task */}
        {isConverted ? (
          <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 px-2">
            <CheckCircle className="w-3.5 h-3.5" />
            Task
          </span>
        ) : (
          <button
            onClick={onConvert}
            disabled={todo.isCompleted}
            className={clsx(
              "p-1.5 rounded-lg transition-colors",
              todo.isCompleted
                ? "text-gray-300 dark:text-slate-600 cursor-not-allowed"
                : "text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30"
            )}
            title="Task로 변환"
          >
            <Calendar className="w-4 h-4" />
          </button>
        )}

        {/* Delete */}
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
          title="삭제"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
