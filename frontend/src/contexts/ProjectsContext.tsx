'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Project, fetchProjects, createProject, updateProject, deleteProject } from '@/api/projects/projects';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectsContextType {
    projects: Project[];
    isLoading: boolean;
    error: Error | null;
    addProject: (name: string) => Promise<Project>;
    editProject: (id: string, name: string) => Promise<Project>;
    removeProject: (id: string) => Promise<void>;
    refreshProjects: () => Promise<void>;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export function ProjectsProvider({ children }: { children: ReactNode }) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const { user, isProfileSetupComplete } = useAuth(); // or your preferred auth hook path

    const refreshProjects = useCallback(async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const data = await fetchProjects();
            setProjects(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch projects', err);
            setError(err instanceof Error ? err : new Error('Unknown error fetching projects'));
        } finally {
            setIsLoading(false);
        }
    }, [user, isProfileSetupComplete]);

    useEffect(() => {
        refreshProjects();
    }, [refreshProjects]);

    const addProject = async (name: string) => {
        try {
            const newProject = await createProject(name);
            setProjects((prev: Project[]) => [newProject, ...prev]);
            return newProject;
        } catch (err) {
            console.error('Failed to create project:', err);
            throw err;
        }
    };

    const editProject = async (id: string, name: string) => {
        try {
            const updated = await updateProject(id, name);
            setProjects((prev: Project[]) => prev.map((p: Project) => p.id === id ? updated : p));
            return updated;
        } catch (err) {
            console.error('Failed to edit project:', err);
            throw err;
        }
    };

    const removeProject = async (id: string) => {
        try {
            await deleteProject(id);
            setProjects((prev: Project[]) => prev.filter((p: Project) => p.id !== id));
        } catch (err) {
            console.error('Failed to remove project:', err);
            throw err;
        }
    };

    return (
        <ProjectsContext.Provider
            value={{
                projects,
                isLoading,
                error,
                addProject,
                editProject,
                removeProject,
                refreshProjects
            }}
        >
            {children}
        </ProjectsContext.Provider>
    );
}

export function useProjects() {
    const context = useContext(ProjectsContext);
    if (context === undefined) {
        throw new Error('useProjects must be used within a ProjectsProvider');
    }
    return context;
}
