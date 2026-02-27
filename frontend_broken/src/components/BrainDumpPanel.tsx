import { Droppable } from '@hello-pangea/dnd';
import { Task } from '../types/task';
import DraggableTaskItem from './DraggableTaskItem';
import QuickAddInput from './QuickAddInput';

interface BrainDumpPanelProps {
  tasks: Task[];
  onAddTask: (title: string) => void;
  onToggleComplete: (id: string, isCompleted: boolean) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onScheduleToday: (id: string) => void;
}

const BrainDumpPanel = ({
  tasks,
  onAddTask,
  onToggleComplete,
  onDeleteTask,
  onEditTask,
  onScheduleToday,
}: BrainDumpPanelProps) => {
  return (
    <div className="h-full flex flex-col bg-gray-50 border-r border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-800">Brain Dump</h2>
        <p className="text-sm text-gray-500 mt-1">Quick capture your thoughts</p>
      </div>

      <div className="p-4">
        <QuickAddInput onAdd={onAddTask} placeholder="What's on your mind?" />
      </div>

      <Droppable droppableId="brain-dump">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto px-4 pb-4 transition-colors ${
              snapshot.isDraggingOver ? 'bg-primary-50' : ''
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="text-sm">No tasks yet</p>
                <p className="text-xs mt-1">Drag tasks here to unschedule</p>
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
                    onScheduleToday={onScheduleToday}
                    showScheduleButton={true}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
            {tasks.length === 0 && snapshot.isDraggingOver && (
              <div className="flex items-center justify-center h-20 border-2 border-dashed border-primary-300 rounded-lg bg-primary-50">
                <p className="text-sm text-primary-600">Drop here to unschedule</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default BrainDumpPanel;
