import { authService } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface SiteContent {
    id: string;
    type: 'carousel' | 'stat' | 'feature' | 'solution' | 'pricing';
    title: string;
    description?: string;
    imageUrl?: string;
    linkUrl?: string;
    metadata?: any;
    order: number;
    isActive: boolean;
}

export interface SiteSettings {
    [key: string]: string;
}

export const siteContentService = {
    async getPublicData(): Promise<{
        content: SiteContent[];
        grouped: Record<string, SiteContent[]>;
        settings: SiteSettings
    }> {
        const url = `${API_URL}/site-content/public`;
        console.log(`[siteContentService] Fetching public data from: ${url}`);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.error(`[siteContentService] Fetch failed with status: ${response.status}`);
                throw new Error('Failed to fetch public site content');
            }
            const data = await response.json();
            const grouped = (data.content || []).reduce((acc: any, item: SiteContent) => {
                if (!acc[item.type]) acc[item.type] = [];
                acc[item.type].push(item);
                return acc;
            }, {});
            return { ...data, grouped };
        } catch (error) {
            console.error(`[siteContentService] Fetch error:`, error);
            throw error;
        }
    },

    async getAllContent(): Promise<SiteContent[]> {
        const response = await fetch(`${API_URL}/site-content`, {
            headers: {
                Authorization: `Bearer ${authService.getToken()}`,
            },
        });
        if (!response.ok) throw new Error('Failed to fetch site content');
        return response.json();
    },

    async createContent(data: Partial<SiteContent>): Promise<SiteContent> {
        const response = await fetch(`${API_URL}/site-content`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authService.getToken()}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create site content');
        return response.json();
    },

    async updateContent(id: string, data: Partial<SiteContent>): Promise<SiteContent> {
        const response = await fetch(`${API_URL}/site-content/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authService.getToken()}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update site content');
        return response.json();
    },

    async deleteContent(id: string): Promise<void> {
        const response = await fetch(`${API_URL}/site-content/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${authService.getToken()}`,
            },
        });
        if (!response.ok) throw new Error('Failed to delete site content');
    },

    async getSettings(): Promise<SiteSettings> {
        const response = await fetch(`${API_URL}/site-content/settings`, {
            headers: {
                Authorization: `Bearer ${authService.getToken()}`,
            },
        });
        if (!response.ok) throw new Error('Failed to fetch site settings');
        return response.json();
    },

    async updateSetting(key: string, value: string): Promise<void> {
        const response = await fetch(`${API_URL}/site-content/settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authService.getToken()}`,
            },
            body: JSON.stringify({ key, value }),
        });
        if (!response.ok) throw new Error('Failed to update setting');
    },

    async uploadFile(file: File, folder: string = 'site'): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/site-content/upload?folder=${folder}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${authService.getToken()}`,
            },
            body: formData,
        });
        if (!response.ok) throw new Error('Failed to upload file');
        const data = await response.json();
        return data.url;
    }
};
