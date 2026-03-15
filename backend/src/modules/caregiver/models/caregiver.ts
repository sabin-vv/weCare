import { model, Schema } from 'mongoose'

import { ICaregiverSchema, VerificationStatus } from '../interfaces/caregiverIneterface'

const caregiverSchema = new Schema<ICaregiverSchema>(
    {
        userId: {
            type: Schema.Types.ObjectId,
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

const Caregiver = model<ICaregiverSchema>('Caregiver', caregiverSchema)

export default Caregiver
