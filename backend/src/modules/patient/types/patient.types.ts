import { Document, Types } from 'mongoose'

export interface PatientDocument extends Document {
    userId: Types.ObjectId
    dateOfBirth: Date
    gender: string
    mobile: string
    isActive: boolean
    profileImage?: string
    createdAt?: Date
    updatedAt?: Date
}

export interface PatientEntity {
    userId: Types.ObjectId
    dateOfBirth: Date
    gender: string
    mobile: string
    profileImage?: string
}
