import { injectable } from 'tsyringe'

import { BaseRepository } from '../../../core/base/base.repository'
import { IActivityLogRepository } from '../interfaces/activityLog.repository.interface'
import { ActivityLogModel } from '../models/activityLog.model'
import { ActivityLogDocument } from '../types/activityLog.types'

@injectable()
export class ActivityLogRepository extends BaseRepository<ActivityLogDocument> implements IActivityLogRepository {
    constructor() {
        super(ActivityLogModel)
    }

    async findAllPaginated(
        filter: Record<string, unknown>,
        page: number,
        limit: number,
    ): Promise<{ data: ActivityLogDocument[]; total: number }> {
        const [data, total] = await Promise.all([
            this.model
                .find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            this.model.countDocuments(filter),
        ])

        return { data, total }
    }
}
