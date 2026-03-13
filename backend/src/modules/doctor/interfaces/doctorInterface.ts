import { Types } from 'mongoose'

export interface Specialization {
    name: string
    documentImage: string
}

export interface SpecializationInput {
    name: string
}

export interface CreateDoctorData {
    userId: Types.ObjectId
    govIdImage: string
    profileImage: string
    medicalCertificateNumber: string
    medicalCertificateImage: string
    medicalCouncilRegisterNumber: string
    medicalCouncilImage: string
    specializations: Specialization[]
}
export interface IRegisterDoctor {
    name: string
    email: string
    mobile: string
    password: string

    medicalCertificateNumber: string

    medicalCouncilRegisterNumber: string

    specializations: Specialization[]
}

export interface updatedRegisterDoctor extends Omit<IRegisterDoctor, 'specializations'> {
    specializations: string
}


