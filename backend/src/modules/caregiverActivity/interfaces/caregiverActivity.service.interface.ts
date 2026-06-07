import {
    CaregiverActivityLogDocument,
    CaregiverActivityLogListResponse,
    CreateActivityLogDTO,
} from '../types/caregiverActivity.types'

export interface ICaregiverActivityService {
    logActivity(dto: CreateActivityLogDTO): Promise<CaregiverActivityLogDocument>
    getActivityLogs(
        userId: string,
        page?: number,
        limit?: number,
    ): Promise<CaregiverActivityLogListResponse>
}
