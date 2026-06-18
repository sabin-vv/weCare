import { Document, Types } from 'mongoose'

export interface IClinicalNote {
    note: string
    doctorName: string
    createdAt?: Date
    updatedAt?: Date
}

export interface ClinicalNoteDocument extends IClinicalNote, Document {}

export interface MedicalRecordDocument extends Document {
    patientId: Types.ObjectId
    allergies: string[]
    pastSurgeries: string
    clinicalNotes: ClinicalNoteDocument[]
    createdAt: Date
    updatedAt: Date
}

export interface MedicalRecordDTO {
    _id: string
    patientId: string
    patientName: string
    age: number
    gender: string
    profileImage?: string
    conditions: string[]
    riskLevel: string
    clinicalStatus: string
    allergies: string[]
    pastSurgeries: string
    clinicalNotes: IClinicalNote[]
    vitals: PatientVitalDTO[]
    prescriptions: PatientPrescriptionDTO[]
}

export interface PatientVitalDTO {
    _id: string
    type: string
    value?: number
    systolic?: number
    diastolic?: number
    unit: string
    recordedAt: string
}

export interface PatientPrescriptionDTO {
    _id: string
    medications: {
        name: string
        dosage: string
        frequency: string
        route: string
        scheduleTimes: string[]
        status: string
    }[]
    status: string
    prescribedAt: string
}
