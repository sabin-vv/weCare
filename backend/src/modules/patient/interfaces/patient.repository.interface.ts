import { Types } from 'mongoose'

import { PatientDocument } from '../types/patient.types'

export interface IPatientRepository {
    findByUserId(userId: Types.ObjectId): Promise<PatientDocument | null>
    create(data: Partial<PatientDocument>): Promise<PatientDocument>
}
