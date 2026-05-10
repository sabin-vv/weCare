import { Types } from 'mongoose'

import { PatientDocument } from '../types/patient.types'

export interface ListPatientParams {
    search: string
    filter: string
    page: number
    limit: number
    userIds?: Types.ObjectId[]
}

export interface IPatientRepository {
    findById(id: string): Promise<PatientDocument | null>
    findByUserId(userId: Types.ObjectId): Promise<PatientDocument | null>
    updateByUserId(userId: Types.ObjectId, data: Partial<PatientDocument>): Promise<PatientDocument | null>
    create(data: Partial<PatientDocument>): Promise<PatientDocument>
    getLastPatientId(): Promise<string | null>
    listPatientsByDoctor(
        doctorId: Types.ObjectId,
        params: ListPatientParams,
    ): Promise<{ data: PatientDocument[]; total: number }>
}
