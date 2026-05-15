import { Document,Types } from 'mongoose'

export interface SymptomLogDocument extends Document {
    _id: Types.ObjectId
    patientId: Types.ObjectId
    caregiverId: Types.ObjectId
    symptom: string
    onsetTime: Date
    severity: 'mild' | 'moderate' | 'severe' | 'critical'
    observations: string
    createdAt: Date
    updatedAt: Date
}

export interface SymptomLogInput {
    patientId: Types.ObjectId
    caregiverId: Types.ObjectId
    symptom: string
    onsetTime: Date
    severity: 'mild' | 'moderate' | 'severe' | 'critical'
    observations: string
}

export interface SymptomLogDTO {
    _id: string
    patientId: string
    caregiverId: string
    symptom: string
    onsetTime: string
    severity: string
    observations: string
    createdAt: string
    updatedAt: string
}