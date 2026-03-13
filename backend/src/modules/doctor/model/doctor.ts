import { Schema, model, Types } from 'mongoose'

type specialization = {
    name: string
    verified: boolean
    documentImage: string
}
type verificationStataus = 'pending' | 'verified' | 'rejected'

interface Doctor {
    userId: Types.ObjectId
    medicalCertificateNumber: string
    medicalCouncilRegisterNumber: string
    specializations: specialization[]
    verificationStatus: verificationStataus
    verifiedBy: Types.ObjectId
    verifiedAt: Date
    rejectReason: string
    govIdImage: string
    profileImage: string
    medicalCouncilImage: string
    medicalCertificateImage: string
    consultationFee: number
    isActive: boolean
}

const doctorModel = new Schema<Doctor>(
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
        isActive: {
            type: Boolean,
            required: true,
            default: true,
        },
    },
    { timestamps: true },
)

const Doctor = model<Doctor>('Doctor', doctorModel)

export default Doctor
