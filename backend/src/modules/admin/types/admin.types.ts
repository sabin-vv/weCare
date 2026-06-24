export type AdminVerificationStatus = 'verified' | 'rejected' | 'pending'

export interface Pagination {
    page: number
    limit: number
    totalCount: number
    totalPages: number
}

export interface PendingDoctorSpecialization {
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
    medicalCouncilImage?: string
    medicalCertificateImage?: string
    govIdImage?: string
    specializations: PendingDoctorSpecialization[]
    createdAt: string
    verificationStatus: 'pending' | 'verified' | 'rejected'
}

export interface PendingDoctorsResponse {
    success: boolean
    doctors: PendingDoctor[]
    pagination: Pagination
}

export interface RecentDoctor {
    _id: string
    name: string
    email: string
    profileImage: string
    medicalCouncilRegisterNumber: string
    medicalCertificateNumber: string
    medicalCouncilImage: string
    medicalCertificateImage: string
    govIdImage: string
    specializations: PendingDoctorSpecialization[]
    createdAt: string
    updatedAt: string
    verificationStatus: 'verified' | 'rejected'
    rejectReason?: string
}

export interface RecentDoctorsResponse {
    success: boolean
    doctors: RecentDoctor[]
    pagination: Pagination
}

export interface PendingCaregiver {
    _id: string
    name: string
    email: string
    profileImage?: string
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

export interface RecentCaregiver {
    _id: string
    name: string
    email: string
    profileImage?: string
    certificateNumber: string
    licenseNumber: string
    certificateImage: string
    licenseImage: string
    govIdImage: string
    createdAt: string
    updatedAt: string
    verificationStatus: 'verified' | 'rejected'
}

export interface RecentCaregiversResponse {
    success: boolean
    caregivers: RecentCaregiver[]
    pagination: Pagination
}

export interface PendingCountResponse {
    count: number
}

export interface AdminUserProfile {
    _id: string
    name: string
    email: string
    role: 'doctor' | 'caregiver' | 'patient'
    isActive: boolean
    createdAt: string
    profileImage?: string
}

export interface UsersResponse {
    users: AdminUserProfile[]
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

export type AdminAppointmentStatus = 'pending_payment' | 'confirmed' | 'cancelled' | 'missed' | 'in_consultation' | 'completed'

export interface AdminAppointmentRowDTO {
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
    status: AdminAppointmentStatus
    consultationFee: number
    paymentStatus?: string
    createdAt: string
}

export interface AdminAppointmentsPaginationDTO {
    page: number
    limit: number
    totalCount: number
    totalPages: number
}

export interface AdminAppointmentsResponseDTO {
    appointments: AdminAppointmentRowDTO[]
    pagination: AdminAppointmentsPaginationDTO
}

export type AdminPaymentStatus = 'pending' | 'success' | 'failed' | 'refund_pending' | 'refunded'
export type AdminPaymentMethod = 'razorpay' | 'wallet'
export type AdminPaymentType = 'consultation' | 'subscription'

export interface AdminPaymentRowDTO {
    _id: string
    paymentId: string
    patientId: string
    patientName: string
    patientEmail: string
    patientMobile: string
    patientProfileImage?: string
    paymentType: AdminPaymentType
    paymentMethod: AdminPaymentMethod
    consultationFee?: number
    platformFee?: number
    totalAmount: number
    status: AdminPaymentStatus
    paidAt?: string
    createdAt: string
}

export interface AdminPaymentsPaginationDTO {
    page: number
    limit: number
    totalCount: number
    totalPages: number
}

export interface AdminPaymentsResponseDTO {
    payments: AdminPaymentRowDTO[]
    pagination: AdminPaymentsPaginationDTO
}

export interface PlatformSettingsDocument extends Document {
    platformName: string
    contactEmail: string
    address: string
    platformFee: number
    platformLogo: string
    platformIcon: string
    subscriptionFee: number
    billingCycle: 'monthly' | 'yearly'
}

export interface PlatformSettings {
    platformName: string
    contactEmail: string
    address: string
    platformFee: number
    platformLogo?: string
    platformIcon?: string
    subscriptionFee?: number
    billingCycle?: 'monthly' | 'yearly'
}
