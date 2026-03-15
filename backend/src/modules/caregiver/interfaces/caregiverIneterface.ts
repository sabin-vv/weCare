import { Types } from 'mongoose'

export interface caregiverRegister {
    name: string
    email: string
    mobile: string
    password: string
    confirmPassword: string
    certificateNumber: string
    licenseNumber: string
}

export enum VerificationStatus {
    pending = 'PENDING',
    verified = 'VERIFIED',
    rejected = 'REJECTED',
}

export interface ICaregiverSchema {
    userId: Types.ObjectId
    profileImage: string
    govIdImage: string
    certificateNumber: string
    certificateImage: string
    licenseNumber: string
    licenseImage: string
    verificationStatus: VerificationStatus
    isActive: boolean
    verifiedBy: Types.ObjectId
    verifiedAt: Date
    rejectReason: string
}

export interface CreateCaregiverData {
    userId: Types.ObjectId
    govIdImage: string
    profileImage: string
    certificateNumber: string
    certificateImage: string
    licenseNumber: string
    licenseImage: string
}
