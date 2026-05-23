import { Types } from 'mongoose'

import { AccountStatus, ClinicalStatus, PatientDocument, RiskLevel } from '../types/patient.types'

export interface ListPatientParams {
    search: string
    page: number
    limit: number
    primaryDoctorId: Types.ObjectId
    accountStatus?: AccountStatus | 'all'
    clinicalStatus?: ClinicalStatus | 'all'
    riskLevel?: RiskLevel | 'all'
    searchUserIds?: Types.ObjectId[]
    userIds?: Types.ObjectId[]
    excludeUserIds?: Types.ObjectId[]
}

export interface IPatientRepository {
    findById(id: string): Promise<PatientDocument | null>
    findByPatientId(patientId: string): Promise<PatientDocument | null>
    findByUserId(userId: Types.ObjectId): Promise<PatientDocument | null>
    updateById(id: string, data: Partial<PatientDocument>): Promise<PatientDocument | null>
    updateByUserId(userId: Types.ObjectId, data: Partial<PatientDocument>): Promise<PatientDocument | null>
    create(data: Partial<PatientDocument>): Promise<PatientDocument>
    getLastPatientId(): Promise<string | null>
    listPatientsByDoctor(params: ListPatientParams): Promise<{ data: PatientDocument[]; total: number }>
}
