export enum UserRole {
    DOCTOR = 'doctor',
    CAREGIVER = 'caregiver',
    PATIENT = 'patient',
    ADMIN = 'admin',
}
import { Document, Types } from 'mongoose'

export interface UserDocument extends Document {
    name: string
    email: string
    mobile: string
    password: string
    role: UserRole
    isActive: boolean
}

export type MulterFiles = Record<string, Express.Multer.File[]>

export interface LoginResponse {
    user: {
        id: Types.ObjectId
        name: string
        email: string
        role: string
    }
    tokens: {
        accessToken: string
        refreshToken: string
    }
}
