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
import { useProjects } from '@/contexts/ProjectsContext';
import { ViewMode } from '../planner/ViewToggle';
import { CreateProjectModal } from '../projects/CreateProjectModal';
import { Plus, ListTodo, Edit2, Trash2, Check, X } from 'lucide-react';

import { Project } from '@/api/projects/projects';

type AppView = 'planner' | 'mandalart' | 'project';

interface SidebarProps {
    currentView: AppView;
    currentViewMode: ViewMode;
    onViewChange: (view: AppView) => void;
    onViewModeChange: (mode: ViewMode) => void;
    onProjectSelect: (project: Project) => void;
    user: any;
}

export const Sidebar = ({
    currentView,
    currentViewMode,
    onViewChange,
    onViewModeChange,
    onProjectSelect,
    user
}: SidebarProps) => {
    const { logout } = useAuth();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const { projects, addProject, editProject, removeProject } = useProjects();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [editingProjectName, setEditingProjectName] = useState('');
    const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

    const handleEditStart = (e: React.MouseEvent, project: { id: string; name: string }) => {
        e.stopPropagation();
        setEditingProjectId(project.id);
        setEditingProjectName(project.name);
    };

    const handleEditSave = async () => {
        if (!editingProjectId || !editingProjectName.trim()) return;
        await editProject(editingProjectId, editingProjectName.trim());
        setEditingProjectId(null);
    };

    const handleEditCancel = () => setEditingProjectId(null);

    const handleDeleteClick = async (e: React.MouseEvent, projectId: string) => {
        e.stopPropagation();
        if (deletingProjectId === projectId) {
            // 두 번째 클릭 → 삭제 확정
            await removeProject(projectId);
            setDeletingProjectId(null);
        } else {
            // 첫 번째 클릭 → 확인 대기
            setDeletingProjectId(projectId);
            setTimeout(() => setDeletingProjectId(null), 3000);
        }
    };

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

                {/* Projects Section */}
                <div className="mt-4 mb-2">
                    {!isCollapsed && (
                        <div className="flex items-center justify-between px-3 mb-2">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Projects</h3>
                            <button
                                onClick={() => setIsProjectModalOpen(true)}
                                className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}

                    {projects.map(project => (
                        <div
                            key={project.id}
                            className="group relative"
                        >
                            {editingProjectId === project.id ? (
                                /* 이름 편집 모드 */
                                <div className="flex items-center gap-1 px-2 py-1.5">
                                    <span className="w-5 h-5 flex items-center justify-center text-primary/70 flex-shrink-0">#</span>
                                    <input
                                        autoFocus
                                        value={editingProjectName}
                                        onChange={e => setEditingProjectName(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') handleEditSave();
                                            if (e.key === 'Escape') handleEditCancel();
                                        }}
                                        className="flex-1 text-sm bg-white dark:bg-slate-800 border border-primary/50 rounded px-1.5 py-0.5 outline-none text-gray-900 dark:text-white min-w-0"
                                    />
                                    <button onClick={handleEditSave} className="p-0.5 text-primary hover:bg-primary/10 rounded"><Check className="w-3.5 h-3.5" /></button>
                                    <button onClick={handleEditCancel} className="p-0.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"><X className="w-3.5 h-3.5" /></button>
                                </div>
                            ) : (
                                /* 일반 모드 */
                                <button
                                    onClick={() => {
                                        onProjectSelect(project);
                                        onViewChange('project');
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentView === 'project'
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                                        }`}
                                    title={project.name}
                                >
                                    <span className="w-5 h-5 flex items-center justify-center text-primary/70 flex-shrink-0">#</span>
                                    {!isCollapsed && <span className="truncate flex-1 text-left">{project.name}</span>}
                                    {/* hover 시 수정/삭제 버튼 */}
                                    {!isCollapsed && (
                                        <span className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span
                                                onClick={(e) => handleEditStart(e, project)}
                                                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                                                title="이름 수정"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                            </span>
                                            <span
                                                onClick={(e) => handleDeleteClick(e, project.id)}
                                                className={`p-1 rounded cursor-pointer transition-colors ${deletingProjectId === project.id
                                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
                                                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10'
                                                    }`}
                                                title={deletingProjectId === project.id ? '한 번 더 클릭하면 삭제됩니다' : '삭제'}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </span>
                                        </span>
                                    )}
                                </button>
                            )}
                        </div>
                    ))}
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
            <CreateProjectModal
                isOpen={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
                onSubmit={async (name) => {
                    await addProject(name);
                }}
            />
        </div>
    );
};
