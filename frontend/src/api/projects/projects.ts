import apiClient from '../client';
import type { Task } from '../tasks/types';

export interface Project {
    id: string;
    name: string;
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

export const updateProject = async (id: string, name: string): Promise<Project> => {
    const { data } = await apiClient.patch<Project>(`/projects/${id}`, { name });
    return data;
};

export const deleteProject = async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
};
