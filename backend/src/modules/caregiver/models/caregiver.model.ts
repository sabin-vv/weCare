import { model, Schema, Types } from 'mongoose'

import { CaregiverDocument, VerificationStatus } from '../types/caregiver.types'

const caregiverSchema = new Schema<CaregiverDocument>(
    {
        userId: {
            type: Types.ObjectId,
            ref: 'User',
            required: true,
        },
        profileImage: {
            type: String,
            required: true,
        },
        govIdImage: {
            type: String,
            required: true,
        },
        certificateNumber: {
            type: String,
            required: true,
            unique: true,
        },

        certificateImage: {
            type: String,
            required: true,
        },
        licenseNumber: {
            type: String,
            required: true,
            unique: true,
        },
        licenseImage: {
            type: String,
            required: true,
        },
        verificationStatus: {
            type: String,
            enum: Object.values(VerificationStatus),
            default: VerificationStatus.pending,
            required: true,
        },
        isActive: {
            type: Boolean,
            required: true,
            default: true,
        },
        verifiedBy: {
            type: Schema.Types.ObjectId,
            ref: 'Admin',
        },
        verifiedAt: {
            type: Date,
        },
        rejectReason: {
            type: String,
        },
    },
    { timestamps: true },
)

export const CaregiverModel = model<CaregiverDocument>('Caregiver', caregiverSchema)
