import { Types } from 'mongoose'
import { injectable } from 'tsyringe'

import { BaseRepository } from '../../../core/base/base.repository'
import { ISymptomLogRepository } from '../interfaces/symptomLog.repository.interface'
import { SymptomLogModel } from '../models/symptomLog.model'
import { SymptomLogDocument, SymptomLogInput } from '../types/symptomLog.types'

@injectable()
export class SymptomLogRepository extends BaseRepository<SymptomLogDocument> implements ISymptomLogRepository {
    constructor() {
        super(SymptomLogModel)
    }

    async findByPatientId(patientId: string): Promise<SymptomLogDocument[]> {
        return this.model.find({ patientId: new Types.ObjectId(patientId) }).sort({ onsetTime: -1, createdAt: -1 })
    }

    async create(data: SymptomLogInput): Promise<SymptomLogDocument> {
        return this.model.create({
            patientId: new Types.ObjectId(data.patientId),
            caregiverId: new Types.ObjectId(data.caregiverId),
            symptom: data.symptom,
            onsetTime: new Date(data.onsetTime),
            severity: data.severity,
            observations: data.observations,
        })
    }
}
