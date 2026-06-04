import { Document, Types } from 'mongoose'

export type AlertType = 'missed_medication' | 'critical_vital' | 'critical_symptom'
export type Severity = 'medium' | 'high' | 'critical'
export type AlertStatus = 'open' | 'acknowledged'

export interface AlertDocument extends Document {
    patientId: Types.ObjectId
    scheduleId?: Types.ObjectId
    type: AlertType
    severity: Severity
    triggerReason: string
    status: AlertStatus
    acknowledgeBy?: Types.ObjectId
    acknowledgeAt?: Date
    acknowledgeNote?: string
    triggeredAt: Date
}
