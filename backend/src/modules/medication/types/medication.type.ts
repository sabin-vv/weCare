import { Types } from 'mongoose'

export type MedicationStatus = 'pending' | 'administered' | 'missed' | 'skipped' | 'cancelled'

export interface MedicationScheduleModel extends Document {
    _id: Types.ObjectId
    prescriptionId: Types.ObjectId
    patientId: Types.ObjectId
    caregiverId: Types.ObjectId
    medicineName: string
    dosage: string
    route: 'oral' | 'injection' | 'IV' | 'inhalation'
    scheduleDate: Date
    scheduleTime: Date
    priority: 'low' | 'medium' | 'high' | 'critical'
    status: MedicationStatus
    cancelledReason?: string
    skippedReason?: string
    missedReason?: string
    missedAt?: Date
    administeredAt?: Date
    administeredBy?: Types.ObjectId
    administrationNotes?: string
    createdAt: Date
    updatedAt: Date
}

export type MedicationScheduleInput = {
    prescriptionId: Types.ObjectId
    patientId: Types.ObjectId
    caregiverId: Types.ObjectId
    medicineName: string
    dosage: string
    route: 'oral' | 'injection' | 'IV' | 'inhalation'
    scheduleDate: Date
    scheduleTime: Date
    priority: 'low' | 'medium' | 'high' | 'critical'
    status: 'pending'
}

export interface MedicationScheduleDTO {
    _id: string
    medicineName: string
    dosage: string
    route: string
    scheduleTime: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    status: MedicationStatus
    administeredAt?: string
    administrationNotes?: string
}
