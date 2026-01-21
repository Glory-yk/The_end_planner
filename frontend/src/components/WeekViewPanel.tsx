import { format, addDays, startOfWeek, isToday, isSameDay } from 'date-fns';
import { Task } from '../types/task';

interface WeekViewPanelProps {
  tasks: Task[];
  weekStart: Date;
  onWeekChange: (date: Date) => void;
  onToggleComplete: (id: string, isCompleted: boolean) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onAddTask: (date: Date) => void;
  onDayClick: (date: Date) => void;
}

const WeekViewPanel = ({
  tasks,
  weekStart,
  onWeekChange,
  onToggleComplete,
  onDeleteTask,
  onEditTask,
  onAddTask,
  onDayClick,
}: WeekViewPanelProps) => {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getTasksForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter((task) => task.scheduledDate === dateStr);
  };

  const handlePrevWeek = () => {
    onWeekChange(addDays(weekStart, -7));
  };

  const handleNextWeek = () => {
    onWeekChange(addDays(weekStart, 7));
  };

  const handleThisWeek = () => {
    onWeekChange(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const weekEnd = addDays(weekStart, 6);
  const weekRangeText = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Week View</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevWeek}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleThisWeek}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                isSameDay(weekStart, startOfWeek(new Date(), { weekStartsOn: 1 }))
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              This Week
            </button>
            <button
              onClick={handleNextWeek}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">{weekRangeText}</p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-7 gap-2 h-full min-h-[500px]">
          {days.map((day) => {
            const dayTasks = getTasksForDay(day);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={`flex flex-col border rounded-lg overflow-hidden ${
                  isCurrentDay ? 'border-primary-400 bg-primary-50/30' : 'border-gray-200'
                }`}
              >
                <div
                  className={`px-2 py-2 text-center cursor-pointer hover:bg-gray-50 ${
                    isCurrentDay ? 'bg-primary-100' : 'bg-gray-50'
                  }`}
                  onClick={() => onDayClick(day)}
                >
                  <p className="text-xs font-medium text-gray-500">{format(day, 'EEE')}</p>
                  <p
                    className={`text-lg font-semibold ${
                      isCurrentDay ? 'text-primary-700' : 'text-gray-800'
                    }`}
                  >
                    {format(day, 'd')}
                  </p>
                  <p className="text-xs text-gray-400">{dayTasks.length} tasks</p>
                </div>

                <div className="flex-1 overflow-y-auto p-1 space-y-1">
                  {dayTasks.map((task) => (
                    <div
                      key={task.id}
                      className="text-xs p-1.5 bg-white rounded border border-gray-100 hover:border-gray-200 cursor-pointer group"
                      onClick={() => onEditTask(task)}
                    >
                      <div className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={task.isCompleted}
                          onChange={(e) => {
                            e.stopPropagation();
                            onToggleComplete(task.id, !task.isCompleted);
                          }}
                          className="w-3 h-3 rounded border-gray-300 text-primary-600"
                        />
                        <span
                          className={`flex-1 truncate ${
                            task.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'
                          }`}
                        >
                          {task.title}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTask(task.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onAddTask(day)}
                  className="px-2 py-1.5 text-xs text-gray-500 hover:text-primary-600 hover:bg-gray-50 border-t border-gray-100"
                >
                  + Add
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeekViewPanel;
