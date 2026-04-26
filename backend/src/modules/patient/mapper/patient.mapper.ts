import { Types } from 'mongoose'

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

export const toPatientResponseDTO = (patient: PatientDocument): PatientResponseDTO => {
    return {
        id: patient._id.toString(),
        userId: patient.userId.toString(),
        patientId: patient.patientId,
        dateOfBirth: patient.dateOfBirth.toISOString(),
        gender: patient.gender,
        profileImage: patient.profileImage,
        isActive: patient.isActive,
    }
}
