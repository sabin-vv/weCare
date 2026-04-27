import { Types } from 'mongoose'

import { UserDocument } from '../../auth/types/auth.types'
import { PatientDocument, PatientEntity } from '../types/patient.types'
import { RegisterPatientDTO } from '../validator/patient.schema'

export interface PatientResponseDTO {
    id: string
    userId: string
    patientId: string
    dateOfBirth: string
    gender: string
    profileImage?: string
    isActive: boolean
}

export const toPatientEntity = (userId: Types.ObjectId, patientId: string, dto: RegisterPatientDTO): PatientEntity => {
    return {
        userId,
        patientId,
        dateOfBirth: new Date(dto.dateOfBirth),
        gender: dto.gender,
    }
}

export const toPatientResponseDTO = (user: UserDocument, patient: PatientDocument): PatientResponseDTO => {
    return {
        id: patient._id.toString(),
        userId: patient.userId.toString(),
        patientId: patient.patientId,
        dateOfBirth: patient.dateOfBirth.toISOString(),
        gender: patient.gender,
        profileImage: patient.profileImage,
        isActive: user.isActive,
    }
}

export interface PatientProfileResponseDTO {
    id: string
    name: string
    email: string
    mobile: string
    patientId: string
    dateOfBirth: string
    gender: string
    conditions: string[]
    profileImage?: string
    isActive: boolean
}

export const toPatientProfileResponseDTO = (
    user: UserDocument,
    patient: PatientDocument,
): PatientProfileResponseDTO => {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        patientId: patient.patientId,
        dateOfBirth: patient.dateOfBirth.toISOString(),
        gender: patient.gender,
        conditions: patient.conditions ?? [],
        profileImage: patient.profileImage,
        isActive: user.isActive,
    }
}
