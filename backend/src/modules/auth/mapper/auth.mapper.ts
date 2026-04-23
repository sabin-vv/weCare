import bcrypt from 'bcrypt'

import { CaregiverUserResponse, DoctorUserResponse, UserResponseDTO } from '../types/auth.response'
import { UserDocument, UserRole } from '../types/auth.types'

interface UserRegistrationDTO {
    name: string
    email: string
    mobile: string
    password: string
}

export interface UserProfile {
    profileImage?: string
    professionalTitle?: string
    verificationStatus?: string
}

export const toUserEntity = async (dto: UserRegistrationDTO, role: UserRole) => {
    return {
        name: dto.name,
        email: dto.email,
        mobile: dto.mobile,
        password: await bcrypt.hash(dto.password, 10),
        role,
    }
}

export const toUserResponseDTO = (user: UserDocument, profile?: UserProfile): UserResponseDTO => {
    const baseUserResponse = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: profile?.profileImage,
    }
    switch (user.role) {
        case UserRole.DOCTOR:
            return {
                ...baseUserResponse,
                professionalTitle: profile?.professionalTitle,
                isProfileComplete: user.isProfileComplete,
                verificationStatus: profile?.verificationStatus,
            } as DoctorUserResponse

        case UserRole.CAREGIVER:
            return {
                ...baseUserResponse,
                isProfileComplete: user.isProfileComplete,
                verificationStatus: profile?.verificationStatus,
                profileImage: profile?.profileImage,
            } as CaregiverUserResponse

        default:
            return baseUserResponse
    }
}
