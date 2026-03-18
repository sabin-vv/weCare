import { Document } from 'mongoose'

export enum Role {
    DOCTOR = 'doctor',
    CAREGIVER = 'caregiver',
    ADMIN = 'admin',
    PATIENT = 'patient',
}

export interface User extends Document {
    name: string
    email: string
    mobile: string
    password: string
    role: Role
    isActive: boolean
}
