const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
import { authService } from './auth';

export const communicationService = {
    async broadcast(message: string, target: 'all' | 'users' | 'resellers') {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/communication/broadcast`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ message, target }),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to send broadcast');
        }
        return response.json();
    },

    async getWhatsappConfig() {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/communication/whatsapp-config`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error('Failed to fetch WhatsApp config');
        return response.json();
    },

    async updateWhatsappConfig(config: any) {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/communication/whatsapp-config`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(config),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to update WhatsApp config');
        }
        return response.json();
    }
};
