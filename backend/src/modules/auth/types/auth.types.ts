export enum UserRole {
    DOCTOR = 'doctor',
    CAREGIVER = 'caregiver',
    PATIENT = 'patient',
    ADMIN = 'admin',
}
import { Document } from 'mongoose'

export interface UserDocument extends Document {
    name: string
    email: string
    mobile: string
    password: string
    role: UserRole
    isActive: boolean
}

export type MulterFiles = Record<string, Express.Multer.File[]>
