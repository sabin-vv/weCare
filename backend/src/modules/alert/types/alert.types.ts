import { Types } from 'mongoose'

export type AlertType = 'missed_medication' | 'critical_vital' | 'critical_symptom' | 'missed_vital'

export type AlertSeverity = 'high' | 'critical'

export type AlertStatus = 'open' | 'acknowledged' | 'resolved'

export interface AlertDocument extends Document {
    _id: Types.ObjectId
    patientId: Types.ObjectId
    caregiverId: Types.ObjectId
    doctorId?: Types.ObjectId
    scheduleId?: Types.ObjectId
    type: AlertType
    severity: AlertSeverity
    triggerReason: string
    status: AlertStatus
    acknowledgeBy?: Types.ObjectId
    acknowledgeAt?: Date
    acknowledgeNote?: string
    resolvedAt?: Date
    resolvedBy?: Types.ObjectId
    notificationSent: boolean
    triggeredAt: Date
    createdAt: Date
    updatedAt: Date
}

export interface CreateAlertInput {
    patientId: Types.ObjectId
    caregiverId: Types.ObjectId
    doctorId?: Types.ObjectId
    scheduleId?: Types.ObjectId
    type: AlertType
    severity: AlertSeverity
    triggerReason: string
}