import type { DoctorProfile } from '../types/doctor.types'

import type { ApiInterface } from '@/modules/auth/api/auth.api.types'
import { api } from '@/services/api'

export const updateProfile = async (data: FormData): Promise<ApiInterface> => {
    const res = await api.post('/doctors/profile', data)

    return res.data
}
export const getDoctorProfile = async (): Promise<DoctorProfile> => {
    const res = await api.get('/doctors/me')

    return res.data
}
