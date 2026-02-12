import { authService } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface Product {
    id: string;
    name: string;
    sku?: string;
    barcode?: string;
    category?: string;
    price: number;
    cost?: number;
    stock_quantity: number;
    description?: string;
    image_url?: string;
}

export const productsService = {
    async getAll(search?: string) {
        const token = authService.getToken();
        const query = search ? `?search=${encodeURIComponent(search)}` : '';
        const response = await fetch(`${API_URL}/products${query}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch products');
        return response.json();
    },

    async create(data: Partial<Product>) {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create product');
        return response.json();
    },

    async update(id: string, data: Partial<Product>) {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update product');
        return response.json();
    },

    async delete(id: string) {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to delete product');
    }
};
