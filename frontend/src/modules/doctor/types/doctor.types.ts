export interface Certificate {
    number: string
    document: File | null
}
export interface Specializations {
    name: string
    document: File | null
}
export interface DoctorDocuments {
    govId: File | null
    profileImage: File | null
    medicalCertificate: Certificate
    councilRegistration: Certificate
}

export interface DoctorProfile {
    id: string
    fullName: string
    email: string
    phoneNumber: string
    profileImage?: string
    professionalTitle?: string
    consultationFee: number
    medicalLicenseNumber: string
    medicalCouncilRegistrationNumber: string
    experienceCertificatesCount: number
    isActive: boolean
    verificationStatus: 'pending' | 'verified' | 'rejected'
}
