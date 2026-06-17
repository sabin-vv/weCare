import type { Dispatch } from 'react'

import type { ApiInterface } from '@/modules/auth/api/auth.api.types'
import type { VerificationStatus } from '@/modules/auth/types/auth.types'

export interface CaregiverDocuments {
    govId: File | null
    profileImage: File | null
    certificate: {
        number: string
        document: File | null
    }
    license: {
        number: string
        document: File | null
    }
}

export interface CaregiverRegisterState {
    basicInfo: {
        name: string
        email: string
        mobile: string
        password: string
        confirmPassword: string
    }
    documents: CaregiverDocuments
}

export interface CaregiverDetailsFormProps {
    prevStep: () => void
    nextStep: () => void
    documents: CaregiverDocuments
    registerData: CaregiverRegisterState
    setRegisterData: Dispatch<React.SetStateAction<CaregiverRegisterState>>
}

export interface CaregiverProfileData {
    id: string
    fullName: string
    email: string
    phoneNumber: string
    profileImage?: string
    govIdImage: string
    certificateNumber: string
    certificateImage: string
    licenseNumber: string
    licenseImage: string
    isActive: boolean
    verificationStatus: VerificationStatus
    rejectReason?: string
}

export interface CaregiverProfileResponse extends ApiInterface {
    data: CaregiverProfileData
}

export type MedicationLogStatus = 'on_time' | 'taken_late' | 'skipped'
export type SymptomSeverity = 'mild' | 'moderate' | 'severe' | 'critical'
export interface AlertCard {
    id: string
    title: string
    medicine: string
    scheduled: string
    route: string
    overdue: string
    tone: 'critical' | 'warning'
}

export interface TimelineItem {
    id: string
    time: string
    title: string
    medicine: string
    note: string
    route: string
    tone: 'critical' | 'warning' | 'success'
    actionLabel: string
}

export interface MedicationLogFormState {
    status: MedicationLogStatus
    takenTime: string
    route: string
    observations: string
}

export interface VitalLogFormState {
    vitalType: string
    systolic: string
    diastolic: string
    value: string
    recordedAt: string
    notes: string
}

export interface SymptomLogFormState {
    symptom: string
    onsetTime: string
    severity: SymptomSeverity
    observations: string
}

export type ReminderSource = 'medication' | 'vital' | 'custom'

export interface PatientOption extends Pick<PatientSummary, '_id' | 'userName'> {}

export interface ReminderItem {
    _id: string
    source: ReminderSource
    title: string
    description?: string
    patientId?: string
    patientName?: string
    scheduleTime: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    status: 'pending' | 'completed' | 'missed'
}

export interface RemindersResponse {
    reminders: ReminderItem[]
    total: number
    pendingCount: number
    completedCount: number
}

export interface CreateReminderDTO {
    title: string
    description?: string
    patientId?: string
    scheduleTime: string
    priority?: 'low' | 'medium' | 'high'
}

export interface MedicationSchedule {
    _id: string
    medicineName: string
    dosage: string
    route: string
    scheduleTime: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    status: 'pending' | 'administered' | 'missed' | 'skipped' | 'cancelled'
    administeredAt?: string
    administrationNotes?: string
}

export interface VitalScheduleItem {
    _id: string
    vitalType: string
    scheduleTime: string
    endDate: string
    priority: string
    status: 'pending' | 'recorded' | 'missed' | 'skipped' | 'cancelled'
    recordedValue?: {
        systolic?: number
        diastolic?: number
        value?: number
        unit?: string
    }
    recordedAt?: string
    recordedNotes?: string
}

export interface PatientSummary extends ApiInterface {
    _id: string
    patientId: string
    userName: string
    userMobile: string
    userEmail: string
    dateOfBirth: string
    gender: string
    conditions: string[]
    riskLevel: string
    clinicalStatus: string
    profileImage?: string
}

export type CaregiverActivityType =
    | 'medication_administered'
    | 'medication_missed'
    | 'vital_recorded'
    | 'vital_missed'
    | 'symptom_logged'

export interface CaregiverActivityLogItem {
    id: string
    caregiverId: string
    patientId: string
    patientName: string
    activityType: CaregiverActivityType
    referenceId?: string
    description?: string
    createdAt: string
    updatedAt: string
}

export interface CaregiverActivityLogPagination {
    page: number
    limit: number
    totalCount: number
    totalPages: number
}

export interface CaregiverActivityLogResponse {
    data: CaregiverActivityLogItem[]
    pagination: CaregiverActivityLogPagination
}

export interface PrescriptionMedication {
    name: string
    dosage: string
    route: string
    frequency: string
    scheduleTimes: string[]
    priority?: string
    instructions?: string
    duration: number
    durationUnit: string
    endDate?: string
}

export interface PrescriptionItem {
    _id: string
    medications: PrescriptionMedication[]
    note?: string
    status: 'active' | 'on_hold' | 'discontinued' | 'amended' | 'completed'
    prescribedAt: string
    endDate?: string
    createdAt: string
    updatedAt: string
}

export interface VitalPlanItem {
    type: 'blood_sugar' | 'blood_pressure' | 'spo2' | 'heart_rate'
    frequencyValue: number
    frequencyUnit: 'hours' | 'days' | 'weeks'
    durationValue: number
    durationUnit: 'hours' | 'days' | 'weeks' | 'months'
}
