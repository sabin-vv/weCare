import { Document, Types } from 'mongoose'

export enum VerificationStatus {
    pending = 'pending',
    verified = 'verified',
    rejected = 'rejected',
}

export interface CaregiverDocument extends Document {
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

export interface CaregiverEntity {
    userId: Types.ObjectId
    certificateNumber: string
    licenseNumber: string

    govIdImage: string
    profileImage: string
    certificateImage: string
    licenseImage: string
}
