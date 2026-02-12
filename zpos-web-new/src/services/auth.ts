
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface LoginResponse {
    access_token: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
    };
}

export interface RegisterData {
    businessName: string;
    ownerEmail: string;
    ownerPhone?: string;
    adminPin: string;
    adminPassword?: string;
    adminFirstName: string;
    adminLastName: string;
}

export const authService = {
    async login(email: string, password: string): Promise<LoginResponse> {
        const response = await fetch(`${API_URL}/auth/login-web`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        const data = await response.json();
        if (data.access_token) {
            this.setToken(data.access_token);
            // Store user details for easy access
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }
        }
        return data;
    },

    async register(data: any) {
        const response = await fetch(`${API_URL}/auth/register-tenant`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }

        const resData = await response.json();
        if (resData.access_token) {
            this.setToken(resData.access_token);
            if (resData.user) {
                localStorage.setItem('user', JSON.stringify(resData.user));
            }
        }
        return resData;
    },

    setToken(token: string) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', token);
        }
    },

    getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('accessToken');
        }
        return null;
    },

    logout() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            // Optional: Redirect to login
            window.location.href = '/login';
        }
    },

    getUser() {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        }
        return null;
    }
};
