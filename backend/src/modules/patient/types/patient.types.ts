import { Document, Types } from 'mongoose'

export type RiskLevel = 'mild' | 'moderate' | 'severe' | 'high_risk'
export type AccountStatus = 'suspended' | 'active' | 'archived'

export type ClinicalStatus = 'active' | 'hospitalized' | 'deceased'
export interface PatientDocument extends Document {
    userId: Types.ObjectId
    patientId: string
    dateOfBirth: Date
    gender: string
    conditions?: string[]
    riskLevel?: RiskLevel
    accountStatus?: AccountStatus
    clinicalStatus?: ClinicalStatus
    primaryDoctorId?: Types.ObjectId
    caregiverId?: Types.ObjectId
    profileImage?: string
    createdAt?: Date
    updatedAt?: Date
}

export interface PatientEntity {
    userId: Types.ObjectId
    patientId: string
    dateOfBirth: Date
    gender: string
    profileImage?: string
}

export interface PatientProfileResponseDTO {
    id: string
    name: string
    email: string
    mobile: string
    patientId: string
    dateOfBirth: string
    gender: string
    conditions: string[]
    profileImage?: string
    isActive: boolean
}

export interface ListPatientMapper {
    _id: string
    patientId: string
    name: string
    profileImage?: string
    conditions?: string[]
    riskLevel?: string
    caregiver?: string
    clinicalStatus: ClinicalStatus
}

export interface PatientListPagination {
    page: number
    limit: number
    totalCount: number
    totalPages: number
}

export interface ListPatientsResponse {
    patients: ListPatientMapper[]
    pagination: PatientListPagination
}

export interface PatientDetailsDTO {
    _id: string
    patientId: string
    name: string
    age: number
    gender: string
    profileImage?: string
    conditions: string[]
    riskLevel?: string
    caregiver: string
    status: string
    clinicalStatus: string
    appointmentStatus: string
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
    recordedBy: string
}

export interface PatientPrescriptionMedicationDTO {
    name: string
    dosage: string
    route: string
    frequency: string
    scheduleTimes: string[]
    priority: string
    instructions?: string
    duration: number
    durationUnit: string
    endDate?: string
}

export interface PatientPrescriptionDTO {
    _id: string
    patientId: string
    prescribedBy: string
    medications: PatientPrescriptionMedicationDTO[]
    note?: string
    status: string
    discontinuedAt?: string
    discontinuedBy?: string
    prescribedAt: string
    endDate?: string
    updatedAt: string
}
