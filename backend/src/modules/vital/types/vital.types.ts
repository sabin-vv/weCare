import { Document, Types } from 'mongoose'

export type VitalType = 'blood_sugar' | 'blood_pressure' | 'spo2' | 'heart_rate'

export type VitalPlanStatus = 'active' | 'completed' | 'cancelled' | 'paused'

export interface VitalPlanItem {
    type: VitalType
    frequencyValue: number
    frequencyUnit: 'hours' | 'days' | 'weeks'
    durationValue: number
    durationUnit: 'hours' | 'days' | 'weeks' | 'months'
}

export interface VitalPlanDocument extends Document {
    patientId: Types.ObjectId
    requestedBy: Types.ObjectId
    vitals: VitalPlanItem[]
    instructions?: string
    status: VitalPlanStatus
    statusReason: string
    createdAt: Date
    updatedAt: Date
}

export interface VitalScheduleDocument extends Document {
    vitalPlanId: Types.ObjectId
    patientId: Types.ObjectId
    caregiverId?: Types.ObjectId
    vitalType: VitalType
    scheduleDate: Date
    scheduleTime: Date
    endDate: Date
    status: 'pending' | 'recorded' | 'missed' | 'skipped' | 'cancelled'
    recordedValue?: {
        systolic?: number
        diastolic?: number
        value?: number
        unit?: string
    }
    recordedAt?: Date
    recordedBy?: Types.ObjectId
    recordedByRole: string
    recordedNotes?: string
}

export interface VitalScheduleDTO {
    _id: string
    vitalType: string
    scheduleTime: string
    endDate: string
    status: string
    recordedValue?: {
        systolic?: number
        diastolic?: number
        value?: number
        unit?: string
    }
    recordedAt?: string
    recordedNotes?: string
}
