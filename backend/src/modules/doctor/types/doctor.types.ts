import { Document, Types } from 'mongoose'

export interface DoctorSpecialization {
    name: string
    documentImage: string
}

export interface DoctorEntity {
    userId: string
    medicalCertificateNumber: string
    medicalCouncilRegisterNumber: string

    specializations: DoctorSpecialization[]

    govIdImage: string
    profileImage: string
    medicalCertificateImage: string
    medicalCouncilImage: string
}

type specialization = {
    name: string
    verified: boolean
    documentImage: string
}

type verificationStataus = 'pending' | 'verified' | 'rejected'

export interface DoctorDocument extends Document {
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
}
