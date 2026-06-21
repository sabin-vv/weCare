import { Document, Types } from 'mongoose'

export const ACTOR_ROLES = ['admin', 'doctor', 'caregiver', 'patient', 'system'] as const
export type ActorRole = (typeof ACTOR_ROLES)[number]

export const ACTIVITY_CATEGORIES = [
    'user_management',
    'verification',
    'appointment',
    'payment',
    'platform_settings',
    'prescription',
    'feedback',
    'alert',
    'subscription',
    'system',
] as const
export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number]

export const TARGET_TYPES = [
    'user',
    'doctor',
    'caregiver',
    'patient',
    'appointment',
    'payment',
    'prescription',
    'platform_setting',
    'alert',
    'feedback',
    'subscription',
] as const
export type TargetType = (typeof TARGET_TYPES)[number]

export const ACTIVITY_ACTIONS = [
    'user_disabled',
    'user_enabled',
    'user_deleted',
    'doctor_verified',
    'doctor_rejected',
    'caregiver_verified',
    'caregiver_rejected',
    'doctor_profile_created',
    'caregiver_profile_created',
    'appointment_booked',
    'appointment_confirmed',
    'appointment_cancelled',
    'appointment_rescheduled',
    'appointment_completed',
    'payment_success',
    'payment_failed',
    'payment_refunded',
    'settings_updated',
    'caregiver_assigned',
    'caregiver_unassigned',
    'prescription_created',
    'prescription_updated',
    'prescription_discontinued',
    'feedback_submitted',
    'feedback_updated',
    'alert_triggered',
    'alert_acknowledged',
    'subscription_activated',
    'subscription_expired',
    'subscription_cancelled',
] as const
export type ActivityAction = (typeof ACTIVITY_ACTIONS)[number]

export interface ActivityLogDocument extends Document {
    performedBy?: Types.ObjectId
    performedByRole: ActorRole
    category: ActivityCategory
    action: ActivityAction
    patientId?: Types.ObjectId
    targetId?: Types.ObjectId
    targetType?: TargetType
    referenceId?: Types.ObjectId
    description: string
    createdAt: Date
    updatedAt: Date
}

export interface CreateActivityLogDTO {
    performedBy?: string
    performedByRole: ActorRole
    category: ActivityCategory
    action: ActivityAction
    patientId?: string
    targetId?: string
    targetType?: TargetType
    referenceId?: string
    description: string
}

export interface ActivityLogResponse {
    id: string
    performedBy?: string
    performedByRole: ActorRole
    category: ActivityCategory
    action: ActivityAction
    patientId?: string
    targetId?: string
    targetType?: TargetType
    referenceId?: string
    description: string
    createdAt: string
}

export interface ActivityLogQuery {
    page?: number
    limit?: number
    category?: ActivityCategory
    performedByRole?: ActorRole
    action?: ActivityAction
    targetType?: TargetType
    search?: string
    startDate?: string
    endDate?: string
}

export interface ActivityLogPagination {
    page: number
    limit: number
    totalCount: number
    totalPages: number
}

export interface ActivityLogListResponse {
    data: ActivityLogResponse[]
    pagination: ActivityLogPagination
}
