import api from '@/shared/services/api'
import type { ApiInterface } from '@/types/api.types'

export const sendOtp = async (email: string): Promise<ApiInterface> => {
    const res = await api.post('/auth/send-otp', {
        email,
    })

    return res.data
}

export const verifyOtp = async (email: string, otp: string): Promise<ApiInterface> => {
    const res = await api.post('/auth/verify-otp', {
        email,
        otp,
    })
    return res.data
}

export const doctorRegister = async (formData: FormData): Promise<ApiInterface> => {
    const res = await api.post('/doctors/register', formData)
    return res.data
}
