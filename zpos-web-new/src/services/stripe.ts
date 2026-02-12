
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
import { authService } from './auth';

export const stripeService = {
    async initiateCheckout(planId: string) {
        const token = authService.getToken();
        if (!token) {
            // If no token, redirect to login with return url or handle via signup
            // For now, let's assume we redirect to login/signup
            window.location.href = `/signup?plan=${planId}`;
            return;
        }

        try {
            const response = await fetch(`${API_URL}/stripe/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ planId }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to initiate checkout');
            }

            const { url } = await response.json();
            if (url) {
                window.location.href = url;
            }
        } catch (error) {
            console.error('Checkout error:', error);
            throw error;
        }
    },

    async getSubscriptions() {
        const token = authService.getToken();
        const url = `${API_URL}/stripe/subscriptions`;
        console.log(`[stripeService] Fetching from: ${url}`);

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`[stripeService] Fetch failed: ${response.status}`, errorData);
            throw new Error(errorData.message || 'Failed to fetch subscriptions');
        }

        const data = await response.json();
        // Return only the data array if it exists (Stripe List response)
        return Array.isArray(data) ? data : (data.data || []);
    }
};
