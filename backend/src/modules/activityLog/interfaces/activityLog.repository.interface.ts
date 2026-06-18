import { ActivityLogDocument } from '../types/activityLog.types'

export interface IActivityLogRepository {
    create(data: Partial<ActivityLogDocument>): Promise<ActivityLogDocument>
    findAllPaginated(
        filter: Record<string, unknown>,
        page: number,
        limit: number,
    ): Promise<{ data: ActivityLogDocument[]; total: number }>
}
