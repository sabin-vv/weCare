import { Document, Types } from 'mongoose'

export type ActivityType = 'medication_administered' | 'medication_missed' | 'vital_recorded' | 'vital_missed' | 'symptom_logged'

export interface CaregiverActivityLogDocument extends Document {
    caregiverId: Types.ObjectId
    patientId: Types.ObjectId
    activityType: ActivityType
    referenceId?: Types.ObjectId
    description?: string
    createdAt: Date
    updatedAt: Date
}

export interface CreateActivityLogDTO {
    caregiverId: Types.ObjectId
    patientId: Types.ObjectId
    activityType: ActivityType
    referenceId?: Types.ObjectId
    description?: string
}

export interface CaregiverActivityLogResponse {
    id: string
    caregiverId: string
    patientId: string
    patientName: string
    activityType: ActivityType
    referenceId?: string
    description?: string
    createdAt: string
    updatedAt: string
}

export interface CaregiverActivityLogPagination {
    page: number
    limit: number
    totalCount: number
    totalPages: number
}

export interface CaregiverActivityLogListResponse {
    data: CaregiverActivityLogResponse[]
    pagination: CaregiverActivityLogPagination
}
