import { Document, Types } from 'mongoose'

export interface PatientRegisterRequest {
    name: string
    email: string
    dateOfBirth: string
    gender: 'male' | 'female' | 'other'
    mobile: string
    password: string
    confirmPassword: string
}

export enum RiskLevel {
    MILD = 'mild',
    MODERATE = 'moderate',
    SEVERE = 'severe',
    HIGH_RISK = 'high_risk',
}
export enum AccountStatus {
    ACTIVE = 'active',
    SUSPENDED = 'suspended',
    ARCHIVED = 'archived',
}
export enum ClinicalStatus {
    ACTIVE = 'active',
    HOSPITALIZED = 'hospitalized',
    DECEASED = 'deceased',
}

export interface Patient extends Document {
    userId: Types.ObjectId
    patientId: string
    dateOfBirth: Date
    gender: 'male' | 'female' | 'other'
    conditions: string[]
    riskLevel: RiskLevel
    accountStatus: AccountStatus
    clinicalStatus: ClinicalStatus
    primaryDoctorId: Types.ObjectId
    caregiverId: Types.ObjectId
    profileImage: string
    createdAt: Date
    updatedAt: Date
}
export interface PatientData extends Pick<Patient, 'userId' | 'gender' | 'patientId'> {
    dateOfBirth: string
}
