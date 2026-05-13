import { Document, Types } from 'mongoose'

export type MedicationRoute = 'oral' | 'injection' | 'IV' | 'inhalation'
export type PrescriptionStatus = 'active' | 'on_hold' | 'discontinued' | 'amended' | 'completed'

export interface MedicationItem {
    name: string
    dosage: string
    route: MedicationRoute
    frequency: string
    scheduleTimes: string[]
    priority?: 'Critical' | 'High' | 'Medium' | 'Low'
    duration: number
    durationUnit: 'Days' | 'Weeks' | 'Months'
    endDate?: Date
    instructions?: string
}

export interface PrescriptionDocument extends Document {
    patientId: Types.ObjectId
    prescribedBy: Types.ObjectId
    medications: MedicationItem[]
    note?: string
    status: PrescriptionStatus
    discontinuedAt?: Date
    discontinuedBy?: Types.ObjectId
    prescribedAt: Date
    endDate?: Date
    createdAt: Date
    updatedAt: Date
}
