import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, ListTodo, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/hooks/useAppStore';
import { TodoItem } from './TodoItem';
import { DatePickerModal } from '@/components/planner/DatePickerModal';
import { RoutineModal } from './RoutineModal';
import { format } from 'date-fns';
import { RecurrenceRule } from '@/types/task';
import clsx from 'clsx';

interface GoalTodoModalProps {
  isOpen: boolean;
  gridIndex: number;
  cellIndex: number;
  goalText: string;
  gridColor?: string;
  onClose: () => void;
}

export const GoalTodoModal = ({
  isOpen,
  gridIndex,
  cellIndex,
  goalText,
  gridColor = '#6b7280',
  onClose
}: GoalTodoModalProps) => {
  const {
    getTodosForCell,
    getLinkedTasks,
    addTodo,
    toggleTodo,
    deleteTodo,
    convertTodoToTask,
    addRoutineFromMandalart
  } = useAppStore();

  const [newTodoText, setNewTodoText] = useState('');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [pendingConvertTodoId, setPendingConvertTodoId] = useState<string | null>(null);
  const [routineModalOpen, setRoutineModalOpen] = useState(false);
  const [pendingRoutineTodoId, setPendingRoutineTodoId] = useState<string | null>(null);

  const todos = getTodosForCell(gridIndex, cellIndex);
  const linkedTasks = getLinkedTasks(gridIndex, cellIndex);

  const completedTodos = todos.filter(t => t.isCompleted).length;
  const completedTasks = linkedTasks.filter(t => t.isCompleted).length;

  const handleAddTodo = () => {
    if (!newTodoText.trim()) return;
    addTodo(gridIndex, cellIndex, newTodoText);
    setNewTodoText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddTodo();
    }
  };

  const handleConvertClick = (todoId: string) => {
    setPendingConvertTodoId(todoId);
    setDatePickerOpen(true);
  };

  const handleDateSelect = (date: Date | null) => {
    // 1. Close modal immediately for instant feedback
    setDatePickerOpen(false);

    // 2. Process in background
    if (pendingConvertTodoId) {
      const scheduledDate = date ? format(date, 'yyyy-MM-dd') : undefined;
      // No await here - let it run in background
      convertTodoToTask(gridIndex, cellIndex, pendingConvertTodoId, scheduledDate);
    }

    // 3. Reset pending ID
    setPendingConvertTodoId(null);
  };

  const pendingTodo = pendingConvertTodoId
    ? todos.find(t => t.id === pendingConvertTodoId)
    : null;

  const pendingRoutineTodo = pendingRoutineTodoId
    ? todos.find(t => t.id === pendingRoutineTodoId)
    : null;

  const handleRoutineClick = (todoId: string) => {
    setPendingRoutineTodoId(todoId);
    setRoutineModalOpen(true);
  };

  const handleRoutineConfirm = (recurrence: RecurrenceRule, startTime?: string) => {
    if (!pendingRoutineTodoId) return;

    const todo = todos.find(t => t.id === pendingRoutineTodoId);
    if (!todo) return;

    // 루틴 생성
    addRoutineFromMandalart(
      gridIndex,
      cellIndex,
      todo.text,
      recurrence,
      startTime
    );

    // Todo 삭제 (루틴으로 대체됨)
    deleteTodo(gridIndex, cellIndex, pendingRoutineTodoId);

    setPendingRoutineTodoId(null);
    setRoutineModalOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div
              className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700"
              style={{ backgroundColor: `${gridColor}15` }}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: gridColor }}
                >
                  <ListTodo className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-gray-900 dark:text-white truncate">
                  {goalText || '목표'}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Todo List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300">
                    할 일 목록
                  </h3>
                  {todos.length > 0 && (
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      {completedTodos}/{todos.length} 완료
                    </span>
                  )}
                </div>

                {todos.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 dark:text-slate-500 text-sm">
                    아직 할 일이 없습니다
                  </div>
                ) : (
                  <div className="space-y-2">
                    <AnimatePresence>
                      {todos.map(todo => (
                        <TodoItem
                          key={todo.id}
                          todo={todo}
                          gridColor={gridColor}
                          onToggle={() => toggleTodo(gridIndex, cellIndex, todo.id)}
                          onDelete={() => deleteTodo(gridIndex, cellIndex, todo.id)}
                          onConvert={() => handleConvertClick(todo.id)}
                          onRoutine={() => handleRoutineClick(todo.id)}
                          isConverted={!!todo.convertedTaskId}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Add Todo Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTodoText}
                  onChange={e => setNewTodoText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="새 할 일 추가..."
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                />
                <button
                  onClick={handleAddTodo}
                  disabled={!newTodoText.trim()}
                  className={clsx(
                    "px-3 py-2 rounded-lg transition-colors flex items-center gap-1",
                    newTodoText.trim()
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "bg-gray-200 dark:bg-slate-600 text-gray-400 dark:text-slate-400 cursor-not-allowed"
                  )}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Linked Tasks Section */}
              {linkedTasks.length > 0 && (
                <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      연결된 Task
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      {completedTasks}/{linkedTasks.length} 완료
                    </span>
                  </div>

                  <div className="space-y-2">
                    {linkedTasks.map(task => (
                      <div
                        key={task.id}
                        className={clsx(
                          "flex items-center gap-2 p-2 rounded-lg text-sm",
                          task.isCompleted
                            ? "bg-green-50 dark:bg-green-900/20"
                            : "bg-gray-50 dark:bg-slate-700/50"
                        )}
                      >
                        <CheckCircle2
                          className={clsx(
                            "w-4 h-4 flex-shrink-0",
                            task.isCompleted
                              ? "text-green-500"
                              : "text-gray-300 dark:text-slate-500"
                          )}
                        />
                        <span
                          className={clsx(
                            "flex-1 truncate",
                            task.isCompleted
                              ? "text-gray-400 dark:text-slate-500 line-through"
                              : "text-gray-700 dark:text-slate-200"
                          )}
                        >
                          {task.title}
                        </span>
                        {task.scheduledDate && (
                          <span className="text-xs text-gray-400 dark:text-slate-500 flex-shrink-0">
                            {task.scheduledDate}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 mb-1">
                      <span>진행률</span>
                      <span>{Math.round((completedTasks / linkedTasks.length) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${(completedTasks / linkedTasks.length) * 100}%`,
                          backgroundColor: gridColor
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Date Picker for Todo -> Task conversion */}
          <DatePickerModal
            isOpen={datePickerOpen}
            taskTitle={pendingTodo?.text || ''}
            onClose={() => {
              setDatePickerOpen(false);
              setPendingConvertTodoId(null);
            }}
            onSelectDate={handleDateSelect}
          />

          {/* Routine Modal for creating recurring tasks */}
          <RoutineModal
            isOpen={routineModalOpen}
            taskTitle={pendingRoutineTodo?.text || ''}
            gridColor={gridColor}
            onClose={() => {
              setRoutineModalOpen(false);
              setPendingRoutineTodoId(null);
            }}
            onConfirm={handleRoutineConfirm}
          />
        </>
      )}
    </AnimatePresence>
  );
};
