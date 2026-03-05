import apiClient from '../client';
import type { Task } from '@/types/task';

export interface Project {
    id: string;
    name: string;
    color: string | null;
    sortOrder: number;
    userId: string;
    tasks?: Task[];
    createdAt: string;
    updatedAt: string;
}

export const fetchProjects = async (): Promise<Project[]> => {
    const { data } = await apiClient.get<Project[]>('/projects');
    return data;
};

export const fetchProject = async (id: string): Promise<Project> => {
    const { data } = await apiClient.get<Project>(`/projects/${id}`);
    return data;
};

export const createProject = async (name: string): Promise<Project> => {
    const { data } = await apiClient.post<Project>('/projects', { name });
    return data;
};

export const updateProject = async (id: string, name: string, color?: string | null): Promise<Project> => {
    const { data } = await apiClient.patch<Project>(`/projects/${id}`, { name, color });
    return data;
};

export const deleteProject = async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
};

// 순서 일괄 업데이트
export const reorderProjects = async (orderedIds: string[]): Promise<void> => {
    await apiClient.patch('/projects/reorder/batch', { orderedIds });
};

// 색상만 업데이트
export const updateProjectColor = async (id: string, color: string | null): Promise<Project> => {
    const { data } = await apiClient.patch<Project>(`/projects/${id}`, { color });
    return data;
};
