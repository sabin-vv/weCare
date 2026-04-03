import type { PendingCaregiversResponse, PendingDoctorsResponse } from '../interfaces/admin.interface'

import { api } from '@/services/api'

export const getPendingDoctors = async (
    page: number,
    limit: number,
    search: string,
): Promise<PendingDoctorsResponse> => {
    const res = await api.get('/admin/pending-doctors', {
        params: { page, limit, search },
    })
    return res.data
}

export const getRecentDoctorVerifications = async (limit: number = 10): Promise<PendingDoctorsResponse> => {
    const res = await api.get('/admin/recent-doctor-verifications', {
        params: { limit },
    })
    return res.data
}

export const verifyDoctor = async (doctorId: string, status: 'verified' | 'rejected'): Promise<{ message: string }> => {
    const res = await api.patch(`/admin/verify-doctor/${doctorId}`, { status })
    return res.data
}

export const verifySpecialization = async (
    doctorId: string,
    specIndex: number,
    verified: boolean,
): Promise<{ message: string }> => {
    const res = await api.patch(`/admin/verify-specialization/${doctorId}/${specIndex}`, {
        verified,
    })
    return res.data
}

export const getPendingCaregivers = async (
    page: number,
    limit: number,
    search: string,
): Promise<PendingCaregiversResponse> => {
    const res = await api.get('/admin/pending-caregivers', {
        params: { page, limit, search },
    })
    return res.data
}

export const verifyCaregiver = async (
    caregiverId: string,
    status: 'verified' | 'rejected',
): Promise<{ message: string }> => {
    const res = await api.patch(`/admin/verify-caregiver/${caregiverId}`, { status })
    return res.data
}

export const getPendingCount = async (): Promise<{ count: number }> => {
    const res = await api.get('/admin/pending-count')
    return res.data
}

export const getUsers = async (role: string, search: string, page: number, limit: number) => {
    const res = await api.get('/admin/users', {
        params: { role, search, page, limit },
    })
    return res.data
}

export const toggleUserStatus = async (userId: string, isActive: boolean): Promise<{ message: string }> => {
    const res = await api.patch(`/admin/toggle-status/${userId}`, {
        isActive,
    })
    return res.data
}
