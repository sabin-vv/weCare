import { injectable } from 'tsyringe'

import { BaseRepository } from '../../../core/base/base.repository'
import { IPrescriptionRepository } from '../interfaces/prescription.repository.interface'
import { PrescriptionModel } from '../models/prescription.model'
import { PrescriptionDocument, PrescriptionStatus } from '../types/prescription.types'

@injectable()
export class PrescriptionRepository
    extends BaseRepository<PrescriptionDocument>
    implements IPrescriptionRepository
{
    constructor() {
        super(PrescriptionModel)
    }

    async findByPatientId(patientId: string): Promise<PrescriptionDocument[]> {
        return await this.model.find({ patientId }).sort({ prescribedAt: -1, createdAt: -1 })
    }

    async updateStatus(
        id: string,
        data: Partial<Pick<PrescriptionDocument, 'status' | 'discontinuedAt' | 'discontinuedBy'>>,
    ): Promise<PrescriptionDocument | null> {
        return await this.model.findByIdAndUpdate(id, data, { returnDocument: 'after' })
    }

    async findByPatientIdAndStatus(patientId: string, status: PrescriptionStatus): Promise<PrescriptionDocument[]> {
        return await this.model.find({ patientId, status }).sort({ prescribedAt: -1, createdAt: -1 })
    }
}
