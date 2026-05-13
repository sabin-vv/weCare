import { injectable } from 'tsyringe'

import { BaseRepository } from '../../../core/base/base.repository'
import { IVitalRepository } from '../interfaces/vital.repository.interface'
import { VitalModel } from '../models/vital.model'
import { vitalPlanModel } from '../models/vitalPlan.model'
import { VitalDocument, VitalPlanDocument, VitalPlanStatus, VitalType } from '../types/vital.types'

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

    async createVitalPlan(data: Partial<VitalPlanDocument>): Promise<VitalPlanDocument> {
        return await vitalPlanModel.create(data)
    }

    async findVitalPlansByPatientId(patientId: string): Promise<VitalPlanDocument[]> {
        return await vitalPlanModel.find({ patientId }).sort({ createdAt: -1 })
    }

    async findVitalPlansByPatientIdAndStatus(patientId: string, status: VitalPlanStatus): Promise<VitalPlanDocument[]> {
        return await vitalPlanModel.find({ patientId, status }).sort({ createdAt: -1 })
    }
}
