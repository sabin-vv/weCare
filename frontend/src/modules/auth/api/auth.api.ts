import { api } from '@/services/api'
import type { ApiInterface, LoginUser } from './auth.api.types'

export const sendOtp = async (email: string, purpose: string): Promise<ApiInterface> => {
    const res = await api.post('/auth/send-otp', {
        email,
        purpose,
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

export const loginUser = async (email: string, password: string, role: string): Promise<LoginUser> => {
    const res = await api.post('/auth/login', { email, password, role })
    return res.data
}

export const logout = async (): Promise<ApiInterface> => {
    const res = await api.post('/auth/logout')
    return res.data
}
