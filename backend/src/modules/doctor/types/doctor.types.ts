import { Document, Types } from 'mongoose'

import { UserDocument } from '../../auth/types/auth.types'

export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export interface TimeRange {
    startTime: string
    endTime: string
}

export interface WeeklySchedule {
    day: WeekDay
    isAvailable: boolean
    timeRanges: TimeRange[]
}

export interface DoctorAvailability {
    timezone: string
    weeklySchedule: WeeklySchedule[]
    slotDuration: number
    startDate: string
    endDate: string
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
    channel: 'email'
    reason: string
}

export interface UpdateDoctorAvailabilityResult {
    availability: DoctorAvailability
    cancelledCount: number
    cancelledAppointments: CancelledAppointmentSummary[]
    notificationFailures: NotificationFailure[]
}

export interface DoctorAvailabilityDocument extends Document {
    doctorId: Types.ObjectId
    timezone: string
    weeklySchedule: WeeklySchedule[]
    slotDuration: number
    startDate?: Date
    endDate?: Date
}

export interface DoctorSpecialization {
    name: string
    documentImage: string
}

export interface DoctorEntity {
    userId: Types.ObjectId
    medicalCertificateNumber: string
    medicalCouncilRegisterNumber: string

    specializations: DoctorSpecialization[]

    govIdImage: string
    profileImage: string
    medicalCertificateImage: string
    medicalCouncilImage: string
}

type specialization = {
    name: string
    verified?: boolean
    documentImage: string
}

type verificationStatus = 'pending' | 'verified' | 'rejected'

export interface DoctorDocument extends Document {
    userId: Types.ObjectId
    medicalCertificateNumber: string
    medicalCouncilRegisterNumber: string

    specializations: specialization[]

    verificationStatus: verificationStatus
    verifiedBy: Types.ObjectId
    verifiedAt: Date
    rejectReason: string

    govIdImage: string
    profileImage: string
    medicalCouncilImage: string
    medicalCertificateImage: string

    consultationFee: number
    isActive: boolean
}

export interface DoctorProfileResponse {
    id: string
    name: string
    email: string
    mobile: string

    profileImage?: string
    professionalTitle?: string
    consultationFee: number

    govIdImage: string
    medicalCertificateNumber: string
    medicalCertificateImage: string
    medicalCouncilRegistrationNumber: string
    medicalCouncilImage: string
    rejectReason?: string

    specialization: DoctorSpecialization[]

    isActive: boolean
    verificationStatus: verificationStatus
}

export interface PopulatedDoctorDocument extends Omit<DoctorDocument, 'userId'> {
    userId: UserDocument
}

export interface DoctorSearchResult {
    id: string
    name: string
    specialty: string
    averageRating?: number
    reviewCount?: number
    profileImage?: string
}

export interface SearchDoctorsParams {
    search?: string
    specialty?: string
    page: number
    limit: number
    sortBy?: 'rating' | 'name' | 'newest'
    sortOrder?: 'asc' | 'desc'
}

export interface DoctorSearchResponse {
    doctors: DoctorSearchResult[]
    specialties: string[]
    totalCount: number
    totalPages: number
    currentPage: number
}

export interface DoctorSearchFilter {
    isActive?: boolean
    verificationStatus: verificationStatus
    'specializations.name'?: string
    'userId.name'?: string
    $or?: Array<{
        'specializations.name'?: { $regex: string; $options: string }
        'userId.name'?: { $regex: string; $options: string }
    }>
}

export interface DoctorSlot {
    start: string
    end: string
    available: boolean
}

export interface DoctorSlotsResponse {
    doctorId: string
    date: string
    timezone: string
    slotDuration: number
    slots: DoctorSlot[]
}
