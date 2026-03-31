import type { PendingCaregiversResponse, PendingDoctorsResponse } from '../interfaces/admin.interface'

import { api } from '@/services/api'

export const adminService = {
    getPendingDoctors: async (page: number, limit: number, search: string) => {
        const res = await api.get<PendingDoctorsResponse>('/admin/pending-doctors', {
            params: { page, limit, search },
        })
        return res.data
    },

    verifyDoctor: async (doctorId: string, status: 'verified' | 'rejected') => {
        const res = await api.patch<{ message: string }>(`/admin/verify-doctor/${doctorId}`, { status })
        return res.data
    },

    verifySpecialization: async (doctorId: string, specIndex: number, verified: boolean) => {
        const res = await api.patch<{ message: string }>(`/admin/verify-specialization/${doctorId}/${specIndex}`, {
            verified,
        })
        return res.data
    },

    getPendingCaregivers: async (page: number, limit: number, search: string) => {
        const res = await api.get<PendingCaregiversResponse>('/admin/pending-caregivers', {
            params: { page, limit, search },
        })
        return res.data
    },

    verifyCaregiver: async (caregiverId: string, status: 'verified' | 'rejected') => {
        const res = await api.patch<{ message: string }>(`/admin/verify-caregiver/${caregiverId}`, { status })
        return res.data
    },

    getPendingCount: async () => {
        const res = await api.get<{ count: number }>('/admin/pending-count')
        return res.data
    },

    getUsers: async (role: string, search: string, page: number, limit: number) => {
        const res = await api.get<any>('/admin/users', {
            params: { role, search, page, limit },
        })
        return res.data
    },

    toggleUserStatus: async (userId: string, isActive: boolean) => {
        const res = await api.patch<{ message: string }>(`/admin/toggle-status/${userId}`, {
            isActive,
        })
        return res.data
    },
}
