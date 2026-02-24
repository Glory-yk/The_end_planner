import { useState } from 'react';

interface QuickAddInputProps {
  onAdd: (title: string) => void;
  placeholder?: string;
}

const QuickAddInput = ({
  onAdd,
  placeholder = 'Add a new task...',
}: QuickAddInputProps) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim());
      setTitle('');
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
