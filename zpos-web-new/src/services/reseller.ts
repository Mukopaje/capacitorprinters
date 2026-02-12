
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
import { authService } from './auth';

export const resellerService = {
    async getProfile() {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/reseller/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error('Failed to fetch reseller profile');
        return response.json();
    },

    async getClients() {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/reseller/clients`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error('Failed to fetch clients');
        return response.json();
    },
};
