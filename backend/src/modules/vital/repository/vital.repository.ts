import { injectable } from 'tsyringe'

import { BaseRepository } from '../../../core/base/base.repository'
import { IVitalRepository } from '../interfaces/vital.repository.interface'
import { VitalModel } from '../models/vital.model'
import { VitalDocument, VitalType } from '../types/vital.types'

@injectable()
export class VitalRepository extends BaseRepository<VitalDocument> implements IVitalRepository {
    constructor() {
        super(VitalModel)
    }

    async findByPatientId(patientId: string): Promise<VitalDocument[]> {
        return await this.model.find({ patientId }).sort({ recordedAt: -1, createdAt: -1 })
    }

    async findByPatientIdAndType(patientId: string, type: VitalType): Promise<VitalDocument[]> {
        return await this.model.find({ patientId, type }).sort({ recordedAt: -1, createdAt: -1 })
    }
}
