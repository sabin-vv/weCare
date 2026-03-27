import { model, Schema } from 'mongoose'

import { DoctorDocument } from '../modules/doctor/types/doctor.types'

const doctorSchema = new Schema<DoctorDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        medicalCertificateNumber: {
            type: String,
            required: true,
            unique: true,
        },
        medicalCouncilRegisterNumber: {
            type: String,
            required: true,
            unique: true,
        },
        specializations: [
            {
                name: {
                    type: String,
                    required: true,
                },
                verified: {
                    type: Boolean,
                    default: false,
                },
                documentImage: {
                    type: String,
                    required: true,
                },
            },
        ],
        verificationStatus: {
            type: String,
            enum: ['pending', 'verified', 'rejected'],
            default: 'pending',
        },
        verifiedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        verifiedAt: {
            type: Date,
        },
        rejectReason: {
            type: String,
        },
        govIdImage: {
            type: String,
        },
        profileImage: {
            type: String,
        },
        medicalCertificateImage: {
            type: String,
        },
        medicalCouncilImage: {
            type: String,
        },
        consultationFee: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    { timestamps: true },
)

export const DoctorModel = model<DoctorDocument>('Doctor', doctorSchema)
