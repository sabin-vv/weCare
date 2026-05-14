import { Types } from 'mongoose'

import { CaregiverDocument, CaregiverWithUser } from '../types/caregiver.types'

export interface PatientSummary {
    _id: Types.ObjectId
    patientId: string
    userId: Types.ObjectId
    dateOfBirth: Date
    gender: string
    conditions: string[]
    riskLevel: string
    clinicalStatus: string
    profileImage?: string
}

export interface ICaregiverRepository {
    findByUserId(userId: Types.ObjectId): Promise<CaregiverDocument | null>
    findById(id: string): Promise<CaregiverDocument | null>
    findAllActive(search?: string): Promise<CaregiverWithUser[]>
    create(data: Partial<CaregiverDocument>): Promise<CaregiverDocument>
    updateByUserId(userId: Types.ObjectId, data: Partial<CaregiverDocument>): Promise<CaregiverDocument | null>
    findPatientsByCaregiver(caregiverId: Types.ObjectId): Promise<PatientSummary[]>
}
