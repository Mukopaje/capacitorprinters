import { authService } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const inventoryService = {
    async getLowStock(warehouseId?: string) {
        const token = authService.getToken();
        let url = `${API_URL}/inventory/low-stock`;
        if (warehouseId) url += `?warehouseId=${warehouseId}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch low stock items');
        return response.json();
    },

    async getInventoryValue(warehouseId?: string) {
        const token = authService.getToken();
        let url = `${API_URL}/inventory/value`;
        if (warehouseId) url += `?warehouseId=${warehouseId}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch inventory value');
        return response.json();
    }
};
