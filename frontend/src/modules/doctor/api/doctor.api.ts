import type { ApiInterface } from '@/modules/auth/api/auth.api.types'
import { api } from '@/services/api'
import type { DoctorProfile } from '../types/doctor.types'

export const updateProfile = async (data: FormData): Promise<ApiInterface> => {
    const res = await api.post('/doctors/profile', data)

    return res.data
}

export const getDoctorProfile = async (): Promise<DoctorProfile> => {
    const res = await api.get<{ success: boolean; message: string; data: DoctorProfile }>('/doctors/me')

    return res.data.data
}
