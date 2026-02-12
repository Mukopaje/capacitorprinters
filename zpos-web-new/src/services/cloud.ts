import { authService } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface RDSSnapshot {
    DBSnapshotIdentifier: string;
    DBInstanceIdentifier: string;
    SnapshotCreateTime: string;
    Status: string;
    PercentProgress: number;
    StorageType: string;
    AllocatedStorage: number;
}

export const cloudService = {
    async getBackups(): Promise<RDSSnapshot[]> {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/cloud/backups`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch backups');
        }

        return response.json();
    },

    async createBackup(): Promise<RDSSnapshot> {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/cloud/backup`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create backup');
        }

        return response.json();
    },

    async deleteBackup(id: string): Promise<void> {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/cloud/backup/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete backup');
        }
    }
};
