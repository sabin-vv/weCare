import { UserRole } from './auth.types'

export interface BaseUserResponse {
    id: string
    name: string
    email: string
    mobile: string
    role: UserRole
    profileImage?: string
}

export interface DoctorUserResponse extends BaseUserResponse {
    isProfileComplete?: boolean
    professionalTitle?: string
    medicalLicenseNumber?: string
    medicalCouncilRegistrationNumber?: string
    specialization?: string
    verificationStatus?: string
}

export interface CaregiverUserResponse extends BaseUserResponse {
    isProfileComplete?: boolean
    verificationStatus?: string
}

export type UserResponseDTO = DoctorUserResponse | CaregiverUserResponse | BaseUserResponse
