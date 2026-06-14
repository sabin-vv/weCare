import {
    ActivityLogDocument,
    ActivityLogListResponse,
    ActivityLogQuery,
    CreateActivityLogDTO,
} from '../types/activityLog.types'

export interface IActivityLogService {
    logActivity(dto: CreateActivityLogDTO): Promise<ActivityLogDocument>
    getActivityLogs(query: ActivityLogQuery): Promise<ActivityLogListResponse>
}
