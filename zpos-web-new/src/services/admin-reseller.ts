
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
import { authService } from './auth';

export const adminResellerService = {
    async getAllResellers() {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/reseller`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error('Failed to fetch resellers');
        return response.json();
    },
    async inviteReseller(data: any) {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/reseller/invite`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to invite reseller');
        }
        return response.json();
    },
};
