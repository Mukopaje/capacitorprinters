const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
import { authService } from './auth';

export const subscriptionsService = {
    async getMyHistory() {
        const response = await fetch(`${API_URL}/subscriptions/history`, {
            headers: {
                Authorization: `Bearer ${authService.getToken()}`,
            },
        });
        if (!response.ok) throw new Error('Failed to fetch subscription history');
        return response.json();
    }
};
