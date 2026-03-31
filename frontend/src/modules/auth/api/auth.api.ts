import { api } from '@/services/api'
import type { ApiInterface, LoginUser, PresignUploadParams, PresignUploadResponse } from './auth.api.types'

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

export const patientRegister = async (data: Record<string, any>): Promise<ApiInterface> => {
    const res = await api.post('/patients/register', data)
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

export const loginUser = async (email: string, password: string, role: string): Promise<LoginUser> => {
    const res = await api.post('/auth/login', { email, password, role })
    return res.data
}

export const logout = async (): Promise<ApiInterface> => {
    const res = await api.post('/auth/logout')
    return res.data
}

export const presignUpload = async (params: PresignUploadParams): Promise<PresignUploadResponse> => {
    const res = await api.post('/uploads/presign', params)
    return res.data
}

export const uploadToS3 = async (uploadUrl: string, file: File): Promise<void> => {
    const res = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
            'Content-Type': file.type,
        },
    })

    if (!res.ok) {
        throw new Error(`S3 upload failed: ${res.status} ${res.statusText}`)
    }
}

export const adminLogin = async (email: string, password: string): Promise<LoginUser> => {
    const res = await api.post('/admin/login', {
        email,
        password,
        role: 'admin',
    })
    return res.data
}
