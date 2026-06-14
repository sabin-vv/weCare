import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { IActivityLogRepository } from '../interfaces/activityLog.repository.interface'
import { IActivityLogService } from '../interfaces/activityLog.service.interface'
import {
    ActivityLogDocument,
    ActivityLogListResponse,
    ActivityLogPagination,
    ActivityLogQuery,
    ActivityLogResponse,
    CreateActivityLogDTO,
} from '../types/activityLog.types'

const toActivityLogResponse = (doc: ActivityLogDocument): ActivityLogResponse => ({
    id: doc._id.toString(),
    performedBy: doc.performedBy?.toString(),
    performedByRole: doc.performedByRole,
    category: doc.category,
    action: doc.action,
    patientId: doc.patientId?.toString(),
    targetId: doc.targetId?.toString(),
    targetType: doc.targetType,
    referenceId: doc.referenceId?.toString(),
    description: doc.description,
    createdAt: doc.createdAt.toISOString(),
})

@injectable()
export class ActivityLogService implements IActivityLogService {
    constructor(
        @inject(TOKENS.IActivityLogRepository)
        private _activityLogRepo: IActivityLogRepository,
    ) {}

    async logActivity(dto: CreateActivityLogDTO): Promise<ActivityLogDocument> {
        return this._activityLogRepo.create({
            performedBy: dto.performedBy ? new Types.ObjectId(dto.performedBy) : undefined,
            performedByRole: dto.performedByRole,
            category: dto.category,
            action: dto.action,
            patientId: dto.patientId ? new Types.ObjectId(dto.patientId) : undefined,
            targetId: dto.targetId ? new Types.ObjectId(dto.targetId) : undefined,
            targetType: dto.targetType,
            referenceId: dto.referenceId ? new Types.ObjectId(dto.referenceId) : undefined,
            description: dto.description,
        })
    }

    async getActivityLogs(query: ActivityLogQuery): Promise<ActivityLogListResponse> {
        const page = query.page || 1
        const limit = query.limit || 20

        const filter: Record<string, unknown> = {}
        if (query.category) filter.category = query.category
        if (query.performedByRole) filter.performedByRole = query.performedByRole
        if (query.action) filter.action = query.action
        if (query.targetType) filter.targetType = query.targetType
        if (query.search) filter.description = { $regex: query.search, $options: 'i' }
        if (query.startDate || query.endDate) {
            const dateFilter: Record<string, Date> = {}
            if (query.startDate) dateFilter.$gte = new Date(query.startDate + 'T00:00:00')
            if (query.endDate) dateFilter.$lte = new Date(query.endDate + 'T23:59:59')
            filter.createdAt = dateFilter
        }

        const { data, total } = await this._activityLogRepo.findAllPaginated(filter, page, limit)

        const pagination: ActivityLogPagination = {
            page,
            limit,
            totalCount: total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        }

        return {
            data: data.map(toActivityLogResponse),
            pagination,
        }
    }
}
