import ViewToggle from './ViewToggle';

type ViewMode = 'daily' | 'week';

interface HeaderProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
}

const Header = ({ viewMode, onViewChange }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-800">Daily Planner</h1>
      <ViewToggle viewMode={viewMode} onViewChange={onViewChange} />
    </header>
  );
};

export default Header;
