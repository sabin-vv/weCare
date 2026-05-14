import type { ChangeEvent } from 'react'

import type { ApiInterface } from '@/modules/auth/api/auth.api.types'

export type DoctorSettingsFormState = {
    name: string
    mobile: string
    email: string

    consultationFee: string
    medicalCertificateNumber: string
    medicalCertificateImage?: string
    medicalCouncilRegistrationNumber: string
    medicalCouncilImage?: string

    specialization?: Specialization[]

    isActive: boolean
}

export interface DoctorRegistrationSectionProps {
    formState: DoctorSettingsFormState
}

export interface DoctorSettingsProfileCardProps {
    savedState: DoctorSettingsFormState
    profileImageUrl: string
    isActive: boolean
    onToggleStatus: () => void
    onImageSelect: (e: ChangeEvent<HTMLInputElement>) => void
    isUploadingImage: boolean
}

export interface DoctorSettingsActionsProps {
    hasChanges: boolean
    isSaving: boolean
    isLoadingProfile: boolean
    onDiscard: () => void
    onSave: () => void
}

export interface DoctorSecuritySectionProps {
    onResetPassword: () => void
}

export interface DoctorPersonalInfoSectionProps {
    formState: DoctorSettingsFormState
    isEditing: boolean
    onToggleEditing: () => void
    onFieldChange: (field: keyof DoctorSettingsFormState) => (event: ChangeEvent<HTMLInputElement>) => void
}

export interface Certificate {
    number: string
    document: File | string | null
}
export interface Specialization {
    name: string
    documentImage: File | string | null
}
export interface DoctorDocuments {
    govId: File | string | null
    profileImage: File | string | null
    medicalCertificate: Certificate
    councilRegistration: Certificate
}

export interface DoctorProfile extends ApiInterface {
    id: string
    name: string
    email: string
    mobile: string

    govIdImage: string
    profileImage?: string
    professionalTitle?: string
    consultationFee: number

    medicalCertificateNumber: string
    medicalCertificateImage: string
    medicalCouncilRegistrationNumber: string
    medicalCouncilImage: string

    specialization: Specialization[]

    isActive: boolean
    verificationStatus: 'pending' | 'verified' | 'rejected'
    rejectReason?: string
}
export interface DoctorProfileResponse extends ApiInterface {
    data: DoctorProfile
}

export type UpdateDoctorProfileData = Pick<
    DoctorProfile,
    'name' | 'consultationFee' | 'email' | 'isActive' | 'profileImage'
>

export interface TimeRange {
    startTime: string
    endTime: string
}

export interface TimeRangeInputProps {
    value: TimeRange
    onChange: (value: TimeRange) => void
    slotDuration: number
    minStartTime?: string
    maxEndTime?: string
    onDelete?: () => void
}

export interface DaySchedule {
    day: string
    isAvailable: boolean
    timeRanges: TimeRange[]
}
export interface DayScheduleRowProps {
    data: DaySchedule
    slotDuration: number
    canAddRange: boolean
    onToggleAvailability: (value: boolean) => void
    onRangeChange: (index: number, value: TimeRange) => void
    onAddRange: () => void
    onDeleteRange: (index: number) => void
}

export interface SlotDurationSelctorProps {
    value: number
    onChange: (value: number) => void
    options?: number[]
}

export interface DateRange {
    start: string
    end: string
}

export interface DateRangePickerProps {
    value: DateRange
    onChange: (value: DateRange) => void
    minDate?: string
    maxDate?: string
}

export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
export interface WeeklySchedule {
    day: WeekDay
    isAvailable: boolean
    timeRanges: { startTime: string; endTime: string }[]
}

export interface DoctorAvailability {
    timezone: string
    weeklySchedule: WeeklySchedule[]
    slotDuration: number
    startDate: string
    endDate: string
}

export interface DoctorAvailabilityResponse extends ApiInterface {
    data: DoctorAvailability
}

export interface CancelledAppointmentSummary {
    appointmentId: string
    patientName: string
    patientEmail: string
    appointmentDate: string
    slotStart: string
    slotEnd: string
    refundPending: boolean
}

export interface NotificationFailure {
    appointmentId: string
    channel: 'email' | 'sms'
    reason: string
}

export interface DoctorAvailabilityUpdateResult {
    availability: DoctorAvailability
    cancelledCount: number
    cancelledAppointments: CancelledAppointmentSummary[]
    notificationFailures: NotificationFailure[]
}

export interface DoctorAvailabilityUpdateResponse extends ApiInterface {
    data: DoctorAvailabilityUpdateResult
}

export interface Patients {
    _id: string
    patientId: string
    name: string
    profileImage?: string
    conditions: string[]
    riskLevel: string
    caregiver: string
    status: string
}
export interface Pagination {
    page: number
    limit: number
    totalCount: number
    totalPages: number
}
export interface ListPatientsResponse {
    patients: Patients[]
    pagination: Pagination
}

export interface PatientDetails {
    _id: string
    patientId: string
    name: string
    age: number
    gender: string
    profileImage?: string
    conditions: string[]
    riskLevel: string
    caregiver: string
    status: string
    clinicalStatus: string
    appointmentStatus: string
    vitals: PatientVital[]
    prescriptions: PatientPrescription[]
}

export interface PatientDetailsResponse {
    success: boolean
    data: PatientDetails
    message: string
}

export interface PatientVital {
    _id: string
    type: 'blood_sugar' | 'blood_pressure' | 'spo2' | 'heart_rate'
    value?: number
    systolic?: number
    diastolic?: number
    unit: string
    recordedAt: string
    recordedBy: string
}

export interface PatientPrescriptionMedication {
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

export interface PatientPrescription {
    _id: string
    patientId: string
    prescribedBy: string
    medications: PatientPrescriptionMedication[]
    note?: string
    status: 'active' | 'on_hold' | 'discontinued' | 'amended' | 'completed'
    discontinuedAt?: string
    discontinuedBy?: string
    prescribedAt: string
    endDate?: string
    updatedAt: string
}

export type PatientSeverityLevel = 'mild' | 'moderate' | 'severe' | 'high_risk'

export interface UpdatePatientConditionPayload {
    conditions: string[]
    riskLevel: PatientSeverityLevel
}

export interface AddPrescriptionMedication {
    name: string
    dosage: string
    route: string
    frequency: string
    scheduleTimes: string[]
    priority: string
    duration: number
    durationUnit: string
    instructions?: string
}

export interface AddPrescriptionPayload {
    medications: AddPrescriptionMedication[]
    note?: string
}

export interface VitalPlanItemPayload {
    type: 'blood_pressure' | 'blood_sugar' | 'heart_rate' | 'temperature' | 'oxygen_saturation'
    frequencyValue: number
    frequencyUnit: 'hours' | 'days' | 'weeks'
    durationValue: number
    durationUnit: 'hours' | 'days' | 'weeks' | 'months'
}

export interface AddVitalPlanPayload {
    vitals: VitalPlanItemPayload[]
    instructions?: string
}

export interface ScheduleTime {
    id: string
    time: string
}

export interface SelectedMedication {
    id: string
    name: string
    dosage: string
    frequency: string
    duration: number
    durationUnit: string
    priority: string
    route: string
    scheduleTimes: ScheduleTime[]
    instructions?: string
}

export interface MedicationProps {
    patientId: string
    patientName: string
    clinicalStatus: string
    prescriptions: PatientPrescription[]
    hasConditions: boolean
    onSuccess: () => void
}

export interface ProfileCardProps {
    name: string
    age: number
    gender: string
    patinetId: string
    riskLevel?: string
    conditions?: string[]
    caregiver?: string
    profileImage?: string
    appointmentStatus: string
    onStartConsultation?: () => void
    onCompleteConsultation?: () => void
    onAddCondition?: () => void
    onAssignCaregiver?: () => void
}
