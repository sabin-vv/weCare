import type { CaregiverProfileResponse } from '../types/caregiver.types'

import type { ApiInterface } from '@/modules/auth/api/auth.api.types'
import { api } from '@/services/api'

export const createCaregiverProfile = async (formData: FormData): Promise<ApiInterface> => {
    const res = await api.post('/caregivers/profile', formData)
    return res.data
}

export const getCaregiverProfile = async (): Promise<CaregiverProfileResponse> => {
    const res = await api.get<CaregiverProfileResponse>('/caregivers/me')
    return res.data
}

export const updateCaregiverProfile = async (data: Record<string, unknown>): Promise<CaregiverProfileResponse> => {
    const res = await api.put<CaregiverProfileResponse>('/caregivers/me', data)
    return res.data
}
