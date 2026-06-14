import { Types } from 'mongoose'

import { ListPatientParams, PatientDocument } from '../types/patient.types'

export interface IPatientRepository {
    findById(id: string): Promise<PatientDocument | null>
    findByPatientId(patientId: string): Promise<PatientDocument | null>
    findByUserId(userId: Types.ObjectId): Promise<PatientDocument | null>
    findUserByUserId(userId: Types.ObjectId): Promise<PatientDocument | null>
    updateById(id: string, data: Partial<PatientDocument>): Promise<PatientDocument | null>
    updateByUserId(userId: Types.ObjectId, data: Partial<PatientDocument>): Promise<PatientDocument | null>
    create(data: Partial<PatientDocument>): Promise<PatientDocument>
    getLastPatientId(): Promise<string | null>
    listPatientsByDoctor(params: ListPatientParams): Promise<{ data: PatientDocument[]; total: number }>

    removeCaregiver(patientId: string): Promise<number>
}
