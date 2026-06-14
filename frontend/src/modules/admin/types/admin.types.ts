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
