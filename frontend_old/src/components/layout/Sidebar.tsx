import { useState } from 'react';
import {
    Calendar,
    Hexagon,
    CheckSquare,
    LogOut,
    Moon,
    Sun,
    ChevronLeft,
    ChevronRight,
    LayoutGrid
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ViewMode } from '../planner/ViewToggle';

type AppView = 'planner' | 'mandalart';

interface SidebarProps {
    currentView: AppView;
    currentViewMode: ViewMode;
    onViewChange: (view: AppView) => void;
    onViewModeChange: (mode: ViewMode) => void;
    user: any;
}

export const Sidebar = ({
    currentView,
    currentViewMode,
    onViewChange,
    onViewModeChange,
    user
}: SidebarProps) => {
    const { logout } = useAuth();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className={clsx(
            "h-full bg-gray-50 dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-all duration-300 flex flex-col",
            isCollapsed ? "w-20" : "w-64"
        )}>
            {/* User Profile / Header */}
            <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-slate-800">
                {!isCollapsed && (
                    <div className="flex items-center gap-3 overflow-hidden">
                        {user?.picture ? (
                            <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                {user?.name?.[0] || 'U'}
                            </div>
                        )}
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {user?.name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-slate-400 truncate">
                                GodLife Mate
                            </span>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400"
                >
                    {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
                {/* Planner Section */}
                <div className="mb-2">
                    {!isCollapsed && <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Plan</h3>}

                    <button
                        onClick={() => {
                            onViewChange('planner');
                            onViewModeChange('today');
                        }}
                        className={clsx(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            currentView === 'planner' && currentViewMode === 'today'
                                ? "bg-primary/10 text-primary"
                                : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                        )}
                    >
                        <CheckSquare className="w-5 h-5" />
                        {!isCollapsed && <span>오늘 (Today)</span>}
                        {currentView === 'planner' && currentViewMode === 'today' && !isCollapsed && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                    </button>

                    <button
                        onClick={() => {
                            onViewChange('planner');
                            onViewModeChange('week');
                        }}
                        className={clsx(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            currentView === 'planner' && currentViewMode === 'week'
                                ? "bg-primary/10 text-primary"
                                : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                        )}
                    >
                        <LayoutGrid className="w-5 h-5" />
                        {!isCollapsed && <span>이번 주 (Week)</span>}
                    </button>

                    <button
                        onClick={() => {
                            onViewChange('planner');
                            onViewModeChange('month');
                        }}
                        className={clsx(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            currentView === 'planner' && currentViewMode === 'month'
                                ? "bg-primary/10 text-primary"
                                : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                        )}
                    >
                        <Calendar className="w-5 h-5" />
                        {!isCollapsed && <span>이번 달 (Month)</span>}
                    </button>
                </div>

                {/* Goals Section */}
                <div className="mt-4 mb-2">
                    {!isCollapsed && <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Goals</h3>}

                    <button
                        onClick={() => onViewChange('mandalart')}
                        className={clsx(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            currentView === 'mandalart'
                                ? "bg-primary/10 text-primary"
                                : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                        )}
                    >
                        <Hexagon className="w-5 h-5" />
                        {!isCollapsed && <span>만다라트 (Mandalart)</span>}
                    </button>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-gray-200 dark:border-slate-800 flex flex-col gap-1">
                <button
                    onClick={toggleDarkMode}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                    {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    {!isCollapsed && <span>{isDarkMode ? '다크 모드' : '라이트 모드'}</span>}
                </button>

                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    {!isCollapsed && <span>로그아웃</span>}
                </button>
            </div>
        </div>
    );
};
