import { Document, Types } from 'mongoose'

export interface MedicationLogDocument extends Document {
    _id: Types.ObjectId
    patientId: Types.ObjectId
    caregiverId: Types.ObjectId
    scheduleId: Types.ObjectId
    status: 'on_time' | 'taken_late' | 'skipped'
    takenTime: Date
    route: string
    observations: string
    createdAt: Date
    updatedAt: Date
}

export interface MedicationLogInput {
    patientId: Types.ObjectId
    caregiverId: Types.ObjectId
    scheduleId: Types.ObjectId
    status: 'on_time' | 'taken_late' | 'skipped'
    takenTime: Date
    route: string
    observations: string
}

export interface MedicationLogDTO {
    _id: string
    patientId: string
    caregiverId: string
    scheduleId: string
    status: string
    takenTime: string
    route: string
    observations: string
    createdAt: string
    updatedAt: string
}
