import { Document, Types } from 'mongoose'

import { UserDocument } from '../../auth/types/auth.types'

export enum VerificationStatus {
    pending = 'pending',
    verified = 'verified',
    rejected = 'rejected',
}

export interface CaregiverDocument extends Document {
    userId: Types.ObjectId
    phoneNumber?: string
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

export interface CaregiverProfileResponse {
    id: string
    fullName: string
    email: string
    phoneNumber: string
    profileImage: string
    govIdImage: string
    certificateNumber: string
    certificateImage: string
    licenseNumber: string
    licenseImage: string
    isActive: boolean
    verificationStatus: VerificationStatus
    rejectReason?: string
}

export type CaregiverProfileMapper = (user: UserDocument, caregiver: CaregiverDocument) => CaregiverProfileResponse

export interface CaregiverWithUser extends Omit<CaregiverDocument, 'userId'> {
    user: UserBasicInfo
}

export interface UserBasicInfo {
    _id: Types.ObjectId
    name: string
    email: string
    mobile: string
}
