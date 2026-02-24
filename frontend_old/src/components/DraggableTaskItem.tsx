import { Draggable } from '@hello-pangea/dnd';
import { Task } from '../types/task';

interface DraggableTaskItemProps {
  task: Task;
  index: number;
  onToggleComplete: (id: string, isCompleted: boolean) => void;
  onDelete: (id: string) => void;
  onClick: (task: Task) => void;
  onScheduleToday?: (id: string) => void;
  showScheduleButton?: boolean;
}

const DraggableTaskItem = ({
  task,
  index,
  onToggleComplete,
  onDelete,
  onClick,
  onScheduleToday,
  showScheduleButton = false,
}: DraggableTaskItemProps) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`group flex items-center gap-3 p-3 bg-white rounded-lg border transition-all ${
            snapshot.isDragging
              ? 'border-primary-400 shadow-lg ring-2 ring-primary-200'
              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
          }`}
        >
          <div
            {...provided.dragHandleProps}
            className="flex items-center justify-center w-5 h-5 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
            </svg>
          </div>

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
      )}
    </Draggable>
  );
};

export default DraggableTaskItem;
