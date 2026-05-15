import { Types } from 'mongoose'
import { injectable } from 'tsyringe'

import { BaseRepository } from '../../../core/base/base.repository'
import { IMedicationLogRepository } from '../interfaces/medicationLog.repository.interface'
import { MedicationLogModel } from '../models/medicationLog.model'
import { MedicationLogDocument, MedicationLogInput } from '../types/medicationLog.types'

@injectable()
export class MedicationLogRepository extends BaseRepository<MedicationLogDocument> implements IMedicationLogRepository {
    constructor() {
        super(MedicationLogModel)
    }

    async findByPatientId(patientId: string): Promise<MedicationLogDocument[]> {
        return this.model.find({ patientId: new Types.ObjectId(patientId) }).sort({ takenTime: -1, createdAt: -1 })
    }

    async create(data: MedicationLogInput): Promise<MedicationLogDocument> {
        return this.model.create({
            patientId: data.patientId,
            caregiverId: data.caregiverId,
            medicationId: data.medicationId,
            status: data.status,
            takenTime: data.takenTime,
            route: data.route,
            observations: data.observations,
        })
    }
}
