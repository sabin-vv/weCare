import { Types } from 'mongoose'
import { injectable } from 'tsyringe'

import { BaseRepository } from '../../../core/base/base.repository'
import { IAlertRepository } from '../interfaces/alert.repository.interface'
import { alertModel } from '../models/alert.model'
import { AlertDocument } from '../types/alert.types'

@injectable()
export class AlertRepository extends BaseRepository<AlertDocument> implements IAlertRepository {
    constructor() {
        super(alertModel)
    }

    async findByPatientIds(patientIds: string[], filter: Record<string, unknown> = {}): Promise<AlertDocument[]> {
        return this.model
            .find({
                patientId: { $in: patientIds.map((id) => new Types.ObjectId(id)) },
                ...filter,
            })
            .populate({ path: 'patientId', populate: { path: 'userId', model: 'User', select: 'name' } })
            .sort({ severity: -1, triggeredAt: -1 })
    }
}
