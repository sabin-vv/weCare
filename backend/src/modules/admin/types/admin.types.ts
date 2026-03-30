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
    profileImage?: string
    certificateNumber: string
    licenseNumber: string
    certificateImage: string
    licenseImage: string
    govIdImage: string
    createdAt: string
}

export interface PendingCaregiversResponse {
    success: boolean
    caregivers: PendingCaregiver[]
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
