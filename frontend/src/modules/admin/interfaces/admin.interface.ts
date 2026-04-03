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
}

export interface PendingCaregiversResponse {
    success: boolean
    caregivers: PendingCaregiver[]
    pagination: Pagination
}
