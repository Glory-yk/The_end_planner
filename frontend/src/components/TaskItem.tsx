import { Task } from '../types/task';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string, isCompleted: boolean) => void;
  onDelete: (id: string) => void;
  onClick: (task: Task) => void;
  onScheduleToday?: (id: string) => void;
  showScheduleButton?: boolean;
}

const TaskItem = ({
  task,
  onToggleComplete,
  onDelete,
  onClick,
  onScheduleToday,
  showScheduleButton = false,
}: TaskItemProps) => {
  return (
    <div className="group flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
      <input
        type="checkbox"
        checked={task.isCompleted}
        onChange={(e) => {
          e.stopPropagation();
          onToggleComplete(task.id, !task.isCompleted);
        }}
        className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
      />

      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => onClick(task)}
      >
        <p
          className={`text-sm font-medium truncate ${
            task.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'
          }`}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-gray-500 truncate mt-0.5">
            {task.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {showScheduleButton && onScheduleToday && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onScheduleToday(task.id);
            }}
            className="px-2 py-1 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
          >
            Today
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
