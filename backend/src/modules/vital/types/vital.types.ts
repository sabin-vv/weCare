import { Document, Types } from 'mongoose'

export type VitalType = 'blood_sugar' | 'blood_pressure' | 'spo2' | 'heart_rate' | 'temperature'
export type VitalPlanType = 'blood_pressure' | 'blood_sugar' | 'heart_rate' | 'temperature' | 'oxygen_saturation'
export type VitalPlanStatus = 'active' | 'completed' | 'cancelled'

export interface VitalDocument extends Document {
    patientId: Types.ObjectId
    type: VitalType
    value?: number
    systolic?: number
    diastolic?: number
    unit: string
    recordedAt: Date
    recordedBy: Types.ObjectId
    createdAt: Date
    updatedAt: Date
}

export interface VitalPlanItem {
    type: VitalPlanType
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
    createdAt: Date
    updatedAt: Date
}

export interface VitalScheduleDocument extends Document {
    vitalPlanId: Types.ObjectId
    patientId: Types.ObjectId
    caregiverId?: Types.ObjectId
    vitalType: VitalPlanType
    scheduleDate: Date
    scheduleTime: Date
    endDate: Date
    priority: 'low' | 'medium' | 'high' | 'critical'
    status: 'pending' | 'recorded' | 'missed' | 'skipped' | 'cancelled'
    recordedValue?: {
        systolic?: number
        diastolic?: number
        value?: number
        unit?: string
    }
    recordedAt?: Date
    recordedBy?: Types.ObjectId
    recordedNotes?: string
    missedReason?: string
    missedAt?: Date
}

export interface VitalScheduleDTO {
    _id: string
    vitalType: string
    scheduleTime: string
    endDate: string
    priority: string
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
