import { Document, Types } from 'mongoose'

export interface VitalLogDocument extends Document {
    _id: Types.ObjectId
    patientId: Types.ObjectId
    caregiverId: Types.ObjectId
    vitalType: string
    value: number
    systolic?: number
    diastolic?: number
    recordedAt: Date
    notes: string
    createdAt: Date
    updatedAt: Date
}

export interface VitalLogInput {
    patientId: Types.ObjectId
    caregiverId: Types.ObjectId
    vitalType: string
    value: number
    systolic?: number
    diastolic?: number
    recordedAt: Date
    notes: string
}

export interface VitalLogDTO {
    _id: string
    patientId: string
    caregiverId: string
    vitalType: string
    value: number
    systolic?: number
    diastolic?: number
    recordedAt: string
    notes: string
    createdAt: string
    updatedAt: string
}
