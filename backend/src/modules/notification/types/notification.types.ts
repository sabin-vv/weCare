import { Document, Types } from 'mongoose'

export const NOTIFICATION_ROLES = ['doctor', 'patient', 'caregiver', 'admin'] as const
export type NotificationRole = (typeof NOTIFICATION_ROLES)[number]

export const NOTIFICATION_TYPES = [
    'critical_vital',
    'critical_symptom',
    'missed_medication',
    'appointment_booked',
    'appointment_confirmed',
    'appointment_rescheduled',
    'appointment_cancelled',
    'appointment_reminder',
    'feedback_received',
    'caregiver_report',
    'medication_reminder',
    'prescription_updated',
    'care_recommendation',
    'medication_schedule_assigned',
    'vital_monitoring_reminder',
    'symptom_check_reminder',
    'doctor_verification_request',
    'caregiver_verification_request',
    'payment_failed',
    'system_error',
    'user_report',
] as const
export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

export interface NotificationDocument extends Document {
    recipientId: Types.ObjectId
    recipientRole: NotificationRole
    type: NotificationType
    title: string
    message: string
    isRead: boolean
    metadata?: Record<string, unknown>
    createdAt: Date
    updatedAt: Date
}

export interface CreateNotificationPayload {
    recipientId: string
    recipientRole: NotificationRole
    type: NotificationType
    title: string
    message: string
    metadata?: Record<string, unknown>
}

export interface NotificationQuery {
    page?: number
    limit?: number
    unreadOnly?: boolean
}
