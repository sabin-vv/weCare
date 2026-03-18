import type { PatientRegisterData } from '../types/auth.types'

import api from '@/shared/services/api'
import type { ApiInterface } from '@/types/api.types'

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

export const caregiverRegister = async (formData: FormData): Promise<ApiInterface> => {
    const res = await api.post('/caregivers/register', formData)
    return res.data
}

export const patientRegister = async (formData: PatientRegisterData): Promise<ApiInterface> => {
    const res = await api.post('/patients/register', formData)
    return res.data
}

export const resetPassword = async (email: string, password: string): Promise<ApiInterface> => {
    const res = await api.post('/auth/reset-password', {
        email,
        password,
    })
    return res.data
}
export const loginUser = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password })
    return res.data
}
