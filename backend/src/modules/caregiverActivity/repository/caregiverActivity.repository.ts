import { injectable } from 'tsyringe'

import { BaseRepository } from '../../../core/base/base.repository'
import { ICaregiverActivityRepository } from '../interfaces/caregiverActivity.repository.interface'
import { CaregiverActivityLogModel } from '../models/caregiverActivity.model'
import { CaregiverActivityLogDocument } from '../types/caregiverActivity.types'

@injectable()
export class CaregiverActivityRepository
    extends BaseRepository<CaregiverActivityLogDocument>
    implements ICaregiverActivityRepository
{
    constructor() {
        super(CaregiverActivityLogModel)
    }

    async findByCaregiverId(
        caregiverId: string,
        limit = 20,
        skip = 0,
    ): Promise<CaregiverActivityLogDocument[]> {
        return this.model
            .find({ caregiverId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({ path: 'patientId', populate: { path: 'userId', model: 'User', select: 'name' } })
    }

    async countByCaregiverId(caregiverId: string): Promise<number> {
        return this.model.countDocuments({ caregiverId })
    }
}
