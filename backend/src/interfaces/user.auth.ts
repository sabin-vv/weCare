import { Document } from 'mongoose'

type Role = 'doctor' | 'caregiver' | 'admin' | 'patient'

export interface IUser extends Document {
    name: string
    email: string
    mobile: string
    password: string
    role: Role
    isActive: boolean
}
