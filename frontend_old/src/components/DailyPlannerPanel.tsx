import { format, addDays, subDays, isToday } from 'date-fns';
import { Droppable } from '@hello-pangea/dnd';
import { Task } from '../types/task';
import DraggableTaskItem from './DraggableTaskItem';
import QuickAddInput from './QuickAddInput';

interface DailyPlannerPanelProps {
  tasks: Task[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onAddTask: (title: string) => void;
  onToggleComplete: (id: string, isCompleted: boolean) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
}

const DailyPlannerPanel = ({
  tasks,
  selectedDate,
  onDateChange,
  onAddTask,
  onToggleComplete,
  onDeleteTask,
  onEditTask,
}: DailyPlannerPanelProps) => {
  const handlePrev = () => onDateChange(subDays(selectedDate, 1));
  const handleNext = () => onDateChange(addDays(selectedDate, 1));
  const handleToday = () => onDateChange(new Date());

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Daily Planner</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={handleToday}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                isToday(selectedDate)
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      <div className="p-4">
        <QuickAddInput onAdd={onAddTask} placeholder="Add task for this day..." />
      </div>

      <Droppable droppableId="daily-planner">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto px-4 pb-4 transition-colors ${
              snapshot.isDraggingOver ? 'bg-blue-50' : ''
            }`}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <svg
                  className="w-12 h-12 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm">No tasks for this day</p>
                <p className="text-xs mt-1">Drag tasks here to schedule</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task, index) => (
                  <DraggableTaskItem
                    key={task.id}
                    task={task}
                    index={index}
                    onToggleComplete={onToggleComplete}
                    onDelete={onDeleteTask}
                    onClick={onEditTask}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
            {tasks.length === 0 && snapshot.isDraggingOver && (
              <div className="flex items-center justify-center h-20 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
                <p className="text-sm text-blue-600">Drop here to schedule for {format(selectedDate, 'MMM d')}</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default DailyPlannerPanel;
