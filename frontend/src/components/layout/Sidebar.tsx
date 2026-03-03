'use client';

import { useState } from 'react';
import {
    Calendar, Hexagon, CheckSquare, LogOut, Moon, Sun,
    ChevronLeft, ChevronRight, LayoutGrid,
    Plus, Edit2, Trash2, Check, X, GripVertical, Palette
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { clsx } from 'clsx';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useProjects } from '@/contexts/ProjectsContext';
import { ViewMode } from '../planner/ViewToggle';
import { CreateProjectModal } from '../projects/CreateProjectModal';
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

// 색상 팔레트 (Notion 스타일)
const COLOR_PALETTE = [
    { label: '기본', value: null, bg: 'bg-gray-400' },
    { label: '빨강', value: '#ef4444', bg: 'bg-red-500' },
    { label: '주황', value: '#f97316', bg: 'bg-orange-500' },
    { label: '노랑', value: '#eab308', bg: 'bg-yellow-500' },
    { label: '초록', value: '#22c55e', bg: 'bg-green-500' },
    { label: '청록', value: '#14b8a6', bg: 'bg-teal-500' },
    { label: '파랑', value: '#3b82f6', bg: 'bg-blue-500' },
    { label: '보라', value: '#a855f7', bg: 'bg-purple-500' },
    { label: '분홍', value: '#ec4899', bg: 'bg-pink-500' },
];

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
    const { projects, addProject, editProject, setProjectColor, removeProject, reorderProjectList } = useProjects();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

    // 이름 편집
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [editingProjectName, setEditingProjectName] = useState('');
    // 삭제 확인
    const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
    // 색상 피커
    const [colorPickerProjectId, setColorPickerProjectId] = useState<string | null>(null);

    /* ── 핸들러 ── */
    const handleEditStart = (e: React.MouseEvent, p: Project) => {
        e.stopPropagation();
        setColorPickerProjectId(null);
        setEditingProjectId(p.id);
        setEditingProjectName(p.name);
    };

    const handleEditSave = async () => {
        if (!editingProjectId || !editingProjectName.trim()) return;
        await editProject(editingProjectId, editingProjectName.trim());
        setEditingProjectId(null);
    };

    const handleDeleteClick = async (e: React.MouseEvent, projectId: string) => {
        e.stopPropagation();
        if (deletingProjectId === projectId) {
            await removeProject(projectId);
            setDeletingProjectId(null);
        } else {
            setDeletingProjectId(projectId);
            setTimeout(() => setDeletingProjectId(null), 3000);
        }
    };

    const handleColorToggle = (e: React.MouseEvent, projectId: string) => {
        e.stopPropagation();
        setColorPickerProjectId(prev => prev === projectId ? null : projectId);
    };

    const handleColorSelect = async (projectId: string, color: string | null) => {
        await setProjectColor(projectId, color);
        setColorPickerProjectId(null);
    };

    /* ── 드래그앤드롭 ── */
    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const ordered = Array.from(projects);
        const [moved] = ordered.splice(result.source.index, 1);
        ordered.splice(result.destination.index, 0, moved);
        reorderProjectList(ordered.map(p => p.id));
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
                            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</span>
                            <span className="text-xs text-gray-500 dark:text-slate-400 truncate">GodLife Mate</span>
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
                {/* Plan Section */}
                <div className="mb-2">
                    {!isCollapsed && <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Plan</h3>}
                    {[
                        { mode: 'today' as ViewMode, label: '오늘 (Today)', Icon: CheckSquare },
                        { mode: 'week' as ViewMode, label: '이번 주 (Week)', Icon: LayoutGrid },
                        { mode: 'month' as ViewMode, label: '이번 달 (Month)', Icon: Calendar },
                    ].map(({ mode, label, Icon }) => (
                        <button
                            key={mode}
                            onClick={() => { onViewChange('planner'); onViewModeChange(mode); }}
                            className={clsx(
                                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                currentView === 'planner' && currentViewMode === mode
                                    ? "bg-primary/10 text-primary"
                                    : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            {!isCollapsed && <span>{label}</span>}
                        </button>
                    ))}
                </div>

                {/* Goals Section */}
                <div className="mt-4 mb-2">
                    {!isCollapsed && <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Goals</h3>}
                    <button
                        onClick={() => onViewChange('mandalart')}
                        className={clsx(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            currentView === 'mandalart' ? "bg-primary/10 text-primary" : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
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

                    {/* 드래그앤드롭 리스트 */}
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="projects">
                            {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps}>
                                    {projects.map((project, index) => (
                                        <Draggable key={project.id} draggableId={project.id} index={index}>
                                            {(drag, snapshot) => (
                                                <div
                                                    ref={drag.innerRef}
                                                    {...drag.draggableProps}
                                                    className={clsx("group relative", snapshot.isDragging && "opacity-80")}
                                                >
                                                    {editingProjectId === project.id ? (
                                                        /* 이름 편집 모드 */
                                                        <div className="flex items-center gap-1 px-2 py-1.5">
                                                            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: project.color || '#9ca3af' }} />
                                                            <input
                                                                autoFocus
                                                                value={editingProjectName}
                                                                onChange={e => setEditingProjectName(e.target.value)}
                                                                onKeyDown={e => {
                                                                    if (e.key === 'Enter') handleEditSave();
                                                                    if (e.key === 'Escape') setEditingProjectId(null);
                                                                }}
                                                                className="flex-1 text-sm bg-white dark:bg-slate-800 border border-primary/50 rounded px-1.5 py-0.5 outline-none text-gray-900 dark:text-white min-w-0"
                                                            />
                                                            <button onClick={handleEditSave} className="p-0.5 text-primary hover:bg-primary/10 rounded"><Check className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => setEditingProjectId(null)} className="p-0.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"><X className="w-3.5 h-3.5" /></button>
                                                        </div>
                                                    ) : (
                                                        /* 일반 모드 */
                                                        <>
                                                            <button
                                                                onClick={() => { onProjectSelect(project); onViewChange('project'); }}
                                                                className={clsx(
                                                                    "w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-medium transition-colors",
                                                                    currentView === 'project'
                                                                        ? "bg-primary/10 text-primary"
                                                                        : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                                                                )}
                                                                title={project.name}
                                                            >
                                                                {/* 드래그 핸들 */}
                                                                {!isCollapsed && (
                                                                    <span
                                                                        {...drag.dragHandleProps}
                                                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 dark:text-slate-600 cursor-grab active:cursor-grabbing flex-shrink-0"
                                                                        onClick={e => e.stopPropagation()}
                                                                    >
                                                                        <GripVertical className="w-3.5 h-3.5" />
                                                                    </span>
                                                                )}
                                                                {/* 색상 도트 */}
                                                                <span
                                                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                                                    style={{ backgroundColor: project.color || '#9ca3af' }}
                                                                />
                                                                {!isCollapsed && <span className="truncate flex-1 text-left">{project.name}</span>}
                                                                {/* 액션 버튼들 */}
                                                                {!isCollapsed && (
                                                                    <span className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <span
                                                                            onClick={e => handleColorToggle(e, project.id)}
                                                                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-400 hover:text-gray-600 cursor-pointer"
                                                                            title="색상 변경"
                                                                        ><Palette className="w-3 h-3" /></span>
                                                                        <span
                                                                            onClick={e => handleEditStart(e, project)}
                                                                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-400 hover:text-gray-600 cursor-pointer"
                                                                            title="이름 수정"
                                                                        ><Edit2 className="w-3 h-3" /></span>
                                                                        <span
                                                                            onClick={e => handleDeleteClick(e, project.id)}
                                                                            className={clsx(
                                                                                "p-1 rounded cursor-pointer transition-colors",
                                                                                deletingProjectId === project.id
                                                                                    ? "bg-red-100 dark:bg-red-900/30 text-red-500"
                                                                                    : "text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                                                                            )}
                                                                            title={deletingProjectId === project.id ? "한 번 더 클릭하면 삭제" : "삭제"}
                                                                        ><Trash2 className="w-3 h-3" /></span>
                                                                    </span>
                                                                )}
                                                            </button>

                                                            {/* 색상 피커 드롭다운 */}
                                                            {colorPickerProjectId === project.id && (
                                                                <div className="absolute left-2 top-full z-50 mt-1 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 flex flex-wrap gap-1.5 w-40">
                                                                    {COLOR_PALETTE.map(c => (
                                                                        <button
                                                                            key={c.label}
                                                                            onClick={() => handleColorSelect(project.id, c.value)}
                                                                            title={c.label}
                                                                            className={clsx(
                                                                                "w-6 h-6 rounded-full transition-transform hover:scale-110 ring-2 ring-offset-1",
                                                                                c.bg,
                                                                                project.color === c.value ? "ring-gray-800 dark:ring-white" : "ring-transparent"
                                                                            )}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
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
                onSubmit={async (name) => { await addProject(name); }}
            />
        </div>
    );
};
