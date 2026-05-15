import { Types } from 'mongoose'
import { injectable } from 'tsyringe'

import { BaseRepository } from '../../../core/base/base.repository'
import { IVitalLogRepository } from '../interfaces/vitalLog.repository.interface'
import { VitalLogModel } from '../models/vitalLog.model'
import { VitalLogDocument, VitalLogInput } from '../types/vitalLog.types'

@injectable()
export class VitalLogRepository extends BaseRepository<VitalLogDocument> implements IVitalLogRepository {
    constructor() {
        super(VitalLogModel)
    }

    async findByPatientId(patientId: string): Promise<VitalLogDocument[]> {
        return this.model.find({ patientId: new Types.ObjectId(patientId) }).sort({ recordedAt: -1, createdAt: -1 })
    }

    async create(data: VitalLogInput): Promise<VitalLogDocument> {
        return this.model.create({
            patientId: new Types.ObjectId(data.patientId),
            caregiverId: new Types.ObjectId(data.caregiverId),
            vitalType: data.vitalType,
            value: data.value,
            systolic: data.systolic,
            diastolic: data.diastolic,
            recordedAt: new Date(data.recordedAt),
            notes: data.notes,
        })
    }
}
