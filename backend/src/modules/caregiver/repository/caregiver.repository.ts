import { Types } from 'mongoose'
import { injectable } from 'tsyringe'

import { BaseRepository } from '../../../core/base/base.repository'
import { ICaregiverRepository } from '../interfaces/caregiver.repository.interface'
import { CaregiverModel } from '../models/caregiver.model'
import { CaregiverDocument } from '../types/caregiver.types'

@injectable()
export class CaregiverRepository extends BaseRepository<CaregiverDocument> implements ICaregiverRepository {
    constructor() {
        super(CaregiverModel)
    }

    async findByUserId(userId: Types.ObjectId): Promise<CaregiverDocument | null> {
        return this.model.findOne({ userId })
    }
}
