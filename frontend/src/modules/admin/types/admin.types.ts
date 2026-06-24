import type { ReactNode } from 'react'

export interface UserProfile {
    _id: string
    name: string
    email: string
    role: 'doctor' | 'caregiver' | 'patient'
    isActive: boolean
    createdAt: string
    profileImage?: string
}

export interface PageCardProps {
    title?: string
    subtitle?: string
    actions?: ReactNode
    children: ReactNode
}

export interface StatCardProps {
    title: string
    value: string | number
    icon?: string
}

export interface Specialization {
    name: string
    documentImage: string
    verified?: boolean
}

export interface PendingDoctor {
    _id: string
    name: string
    email: string
    profileImage: string
    medicalCouncilRegisterNumber: string
    medicalCertificateNumber: string
    medicalCouncilImage: string
    medicalCertificateImage: string
    govIdImage: string
    specializations: Specialization[]
    createdAt: string
    updatedAt?: string
    verificationStatus?: 'pending' | 'verified' | 'rejected'
    rejectReason?: string
}

export interface Pagination {
    page: number
    limit: number
    totalCount: number
    totalPages: number
}

export interface PendingDoctorsResponse {
    success: boolean
    doctors: PendingDoctor[]
    pagination: Pagination
}

export interface PendingCaregiver {
    _id: string
    name: string
    email: string
    profileImage: string
    certificateNumber: string
    licenseNumber: string
    certificateImage: string
    licenseImage: string
    govIdImage: string
    createdAt: string
    verificationStatus: 'pending' | 'verified' | 'rejected'
}

export interface PendingCaregiversResponse {
    success: boolean
    caregivers: PendingCaregiver[]
    pagination: Pagination
}

export interface RecentCaregiver extends PendingCaregiver {
    updatedAt: string
    verificationStatus: 'verified' | 'rejected'
}

export interface RecentCaregiversResponse {
    success: boolean
    caregivers: RecentCaregiver[]
    pagination: Pagination
}

export interface ActivityLogEntry {
    id: string
    performedBy?: string
    performedByRole: string
    category: string
    action: string
    targetType?: string
    targetId?: string
    description: string
    createdAt: string
}

export interface ActivityLogsResponse {
    success: boolean
    data: ActivityLogEntry[]
    pagination: Pagination
}

export interface RecentUser {
    _id: string
    name: string
    email: string
    role: string
    createdAt: string
}

export interface AppointmentStats {
    today: { confirmed: number; completed: number; cancelled: number; missed: number; inConsultation: number }
    thisMonth: { pendingPayment: number; confirmed: number; completed: number; cancelled: number; missed: number; inConsultation: number }
    dailyTrend: { date: string; confirmed: number; completed: number; cancelled: number; missed: number }[]
}

export interface RevenueStats {
    thisMonth: { totalRevenue: number; platformFees: number; consultationFees: number }
    dailyRevenue: { date: string; amount: number }[]
    paymentMethods: { razorpay: number; wallet: number }
}

export interface PendingVerificationUser {
    _id: string
    name: string
    email: string
    profileImage?: string
    role: 'doctor' | 'caregiver'
    createdAt: string
}

export interface DashboardChartData {
    appointmentStats: AppointmentStats
    revenueStats: RevenueStats
    recentUsers: RecentUser[]
    pendingVerifications: PendingVerificationUser[]
    totalDoctors: number
    totalCaregivers: number
    totalPatients: number
}

export interface AdminAppointment {
    _id: string
    appointmentId: string
    patientId: string
    patientName: string
    patientEmail: string
    patientMobile: string
    patientProfileImage?: string
    doctorId: string
    doctorName: string
    doctorProfileImage?: string
    specialization: string
    appointmentDate: string
    slotStart: string
    slotEnd: string
    status: 'pending_payment' | 'confirmed' | 'cancelled' | 'missed' | 'in_consultation' | 'completed'
    consultationFee: number
    paymentStatus?: string
    createdAt: string
}

export interface AdminAppointmentsResponse {
    appointments: AdminAppointment[]
    pagination: Pagination
}

export interface PlatformSettings {
    platformName: string
    contactEmail: string
    address: string
    platformFee: number
    platformLogo?: string
    platformIcon?: string
    subscriptionFee: number
    billingCycle: 'monthly' | 'yearly'
}

export interface ActivityLogFilters {
    category?: string
    performedByRole?: string
    targetType?: string
    search?: string
    startDate?: string
    endDate?: string
}
