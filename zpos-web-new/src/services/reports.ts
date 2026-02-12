
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
import { authService } from './auth';

export const reportsService = {
    async getStats() {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/reports/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error('Failed to fetch stats');
        return response.json();
    },
};
