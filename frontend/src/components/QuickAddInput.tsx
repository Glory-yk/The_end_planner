import { useState } from 'react';

import { useProjects } from '../contexts/ProjectsContext';

interface QuickAddInputProps {
  onAdd: (title: string, projectId?: string) => void;
  placeholder?: string;
  showProjectSelector?: boolean;
}

const QuickAddInput = ({
  onAdd,
  placeholder = 'Add a new task...',
  showProjectSelector = false,
}: QuickAddInputProps) => {
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const { projects } = useProjects();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim(), projectId);
      setTitle('');
      setProjectId(undefined);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
      {showProjectSelector && projects.length > 0 && (
        <select
          value={projectId || ''}
          onChange={(e) => setProjectId(e.target.value || undefined)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white w-32 truncate"
        >
          <option value="">Inbox</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      )}
      <button
        type="submit"
        disabled={!title.trim()}
        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Add
      </button>
    </form>
  );
};

export default QuickAddInput;
