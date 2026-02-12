import { authService } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface AppBinary {
    id: string;
    name: string;
    platform: string;
    version: string;
    url: string;
    release_notes?: string;
    is_active: boolean;
    created_at: string;
}

export const appsService = {
    async getAllApps(): Promise<AppBinary[]> {
        const response = await fetch(`${API_URL}/apps`, {
            headers: {
                Authorization: `Bearer ${authService.getToken()}`,
            },
        });
        if (!response.ok) throw new Error('Failed to fetch apps');
        return response.json();
    },

    async getPublicApps(): Promise<AppBinary[]> {
        const response = await fetch(`${API_URL}/apps/public`);
        if (!response.ok) throw new Error('Failed to fetch public apps');
        return response.json();
    },

    async createApp(data: Partial<AppBinary>): Promise<AppBinary> {
        const response = await fetch(`${API_URL}/apps`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authService.getToken()}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create app link');
        return response.json();
    },

    async updateApp(id: string, data: Partial<AppBinary>): Promise<AppBinary> {
        const response = await fetch(`${API_URL}/apps/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authService.getToken()}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update app link');
        return response.json();
    },

    async deleteApp(id: string): Promise<void> {
        const response = await fetch(`${API_URL}/apps/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${authService.getToken()}`,
            },
        });
        if (!response.ok) throw new Error('Failed to delete app link');
    },
};
