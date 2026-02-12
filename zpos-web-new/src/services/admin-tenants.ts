const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
import { authService } from './auth';

export const adminTenantsService = {
    async getAllTenants() {
        const response = await fetch(`${API_URL}/tenants`, {
            headers: {
                Authorization: `Bearer ${authService.getToken()}`,
            },
        });
        if (!response.ok) throw new Error('Failed to fetch tenants');
        return response.json();
    },

    async updateTenant(id: string, data: any) {
        const response = await fetch(`${API_URL}/tenants/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authService.getToken()}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update tenant');
        return response.json();
    },

    async updateLicense(id: string, expiresAt: string) {
        const response = await fetch(`${API_URL}/tenants/${id}/license`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authService.getToken()}`,
            },
            body: JSON.stringify({ expiresAt }),
        });
        if (!response.ok) throw new Error('Failed to update license');
        return response.json();
    },

    async createManualSubscription(data: any) {
        const response = await fetch(`${API_URL}/subscriptions/manual`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authService.getToken()}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create manual subscription');
        return response.json();
    },

    async getSubscriptionHistory(tenantId: string) {
        const url = tenantId === 'all'
            ? `${API_URL}/subscriptions/admin/history`
            : `${API_URL}/subscriptions/admin/history/${tenantId}`;
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${authService.getToken()}`,
            },
        });
        if (!response.ok) throw new Error('Failed to fetch subscription history');
        return response.json();
    },

    async deleteTenant(id: string) {
        const response = await fetch(`${API_URL}/tenants/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${authService.getToken()}`,
            },
        });
        if (!response.ok) throw new Error('Failed to delete tenant');
    },
};
