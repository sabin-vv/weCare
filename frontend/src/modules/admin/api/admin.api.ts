import type { PresignUploadParams, PresignUploadResponse } from '../../auth/api/auth.api.types'
import type {
    PendingCaregiversResponse,
    PendingDoctorsResponse,
    PlatformSettings,
    RecentCaregiversResponse,
} from '../interfaces/admin.interface'

import { api } from '@/services/api'
import { ADMIN_API, UPLOADS_API } from '@/shared/constants/api.constants'

export const getPendingDoctors = async (
    page: number,
    limit: number,
    search: string,
): Promise<PendingDoctorsResponse> => {
    const res = await api.get(`${ADMIN_API}/pending-doctors`, {
        params: { page, limit, search },
    })
    return res.data
}

export const getRecentDoctorVerifications = async (limit: number = 10): Promise<PendingDoctorsResponse> => {
    const res = await api.get(`${ADMIN_API}/recent-doctor-verifications`, {
        params: { limit },
    })
    return res.data
}

export const verifyDoctor = async (
    doctorId: string,
    status: 'verified' | 'rejected',
    reason?: string,
): Promise<{ message: string }> => {
    const res = await api.patch(`${ADMIN_API}/verify-doctor/${doctorId}`, { status, reason })
    return res.data
}

export const verifySpecialization = async (
    doctorId: string,
    specIndex: number,
    verified: boolean,
): Promise<{ message: string }> => {
    const res = await api.patch(`${ADMIN_API}/verify-specialization/${doctorId}/${specIndex}`, {
        verified,
    })
    return res.data
}

export const getPendingCaregivers = async (
    page: number,
    limit: number,
    search: string,
): Promise<PendingCaregiversResponse> => {
    const res = await api.get(`${ADMIN_API}/pending-caregivers`, {
        params: { page, limit, search },
    })
    return res.data
}

export const getRecentCaregiverVerifications = async (limit: number = 10): Promise<RecentCaregiversResponse> => {
    const res = await api.get(`${ADMIN_API}/recent-caregiver-verifications`, {
        params: { limit },
    })
    return res.data
}

export const verifyCaregiver = async (
    caregiverId: string,
    status: 'verified' | 'rejected',
): Promise<{ message: string }> => {
    const res = await api.patch(`${ADMIN_API}/verify-caregiver/${caregiverId}`, { status })
    return res.data
}

export const getPendingCount = async (): Promise<{ count: number }> => {
    const res = await api.get(`${ADMIN_API}/pending-count `)
    return res.data
}

export const getPendingDoctorsCount = async (): Promise<{ count: number }> => {
    const res = await api.get(`${ADMIN_API}/pending-doctors-count`)
    return res.data
}

export const getPendingCaregiversCount = async (): Promise<{ count: number }> => {
    const res = await api.get(`${ADMIN_API}/pending-caregivers-count`)
    return res.data
}

export const getUsers = async (role: string, search: string, page: number, limit: number) => {
    const res = await api.get(`${ADMIN_API}/users`, {
        params: { role, search, page, limit },
    })
    return res.data
}

export const toggleUserStatus = async (userId: string, isActive: boolean): Promise<{ message: string }> => {
    const res = await api.patch(`${ADMIN_API}/toggle-status/${userId}`, {
        isActive,
    })
    return res.data
}

export const getPlatformSettings = async (): Promise<PlatformSettings> => {
    const res = await api.get(`${ADMIN_API}/platform-settings`)
    return res.data
}

export const updatePlatformSettings = async (settings: Partial<PlatformSettings>): Promise<PlatformSettings> => {
    const res = await api.put(`${ADMIN_API}/platform-settings`, settings)
    return res.data
}

export const presignUpload = async (params: PresignUploadParams): Promise<PresignUploadResponse> => {
    const res = await api.post(`${UPLOADS_API}/presign`, params)
    return res.data
}

export const uploadToS3 = async (uploadUrl: string, file: File): Promise<void> => {
    await api.put(uploadUrl, file, {
        headers: {
            'Content-Type': file.type,
        },
    })
}
