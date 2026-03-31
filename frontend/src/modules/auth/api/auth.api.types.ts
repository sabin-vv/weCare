import type { Role } from '../types/auth.types'

export interface ApiInterface {
    success: boolean
    message: string
}

export interface LoginUser extends ApiInterface {
    user: {
        id: string
        name: string
        email: string
        role: Role
    }
}

export type AllowedContentType = 'image/png' | 'image/jpeg' | 'application/pdf'

export interface PresignUploadParams {
    fileName: string
    contentType: AllowedContentType
    folder?: string
    size?: number
}

export interface PresignUploadResponse {
    success: boolean
    uploadUrl: string
    key: string
}
