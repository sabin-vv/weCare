import {
    AdminUserProfile,
    PendingCaregiver,
    PendingDoctor,
    PendingDoctorSpecialization,
    PlatformSettings,
    RecentCaregiver,
    RecentDoctor,
} from '../types/admin.types'

interface RawRecord extends Record<string, unknown> {
    _id?: unknown
    createdAt?: unknown
    updatedAt?: unknown
    verifiedAt?: unknown
    name?: string
    email?: string
    profileImage?: string
    verificationStatus?: unknown
}

export const toPendingDoctorDTO = (doctor: RawRecord): PendingDoctor => {
    return {
        _id: (doctor._id as { toString(): string })?.toString() || '',
        name: doctor.name || '',
        email: doctor.email || '',
        profileImage: doctor.profileImage || '',
        medicalCouncilRegisterNumber: (doctor.medicalCouncilRegisterNumber as string) || '',
        medicalCertificateNumber: (doctor.medicalCertificateNumber as string) || '',
        medicalCouncilImage: (doctor.medicalCouncilImage as string) || '',
        medicalCertificateImage: (doctor.medicalCertificateImage as string) || '',
        govIdImage: (doctor.govIdImage as string) || '',
        specializations: (doctor.specializations as PendingDoctorSpecialization[]) || [],
        createdAt: (doctor.createdAt as { toString(): string })?.toString() || '',
        verificationStatus: doctor.verificationStatus as 'verified' | 'rejected' | 'pending',
    }
}

export const toRecentDoctorDTO = (doctor: RawRecord): RecentDoctor => {
    const pending = toPendingDoctorDTO(doctor)
    return {
        ...pending,
        medicalCouncilImage: pending.medicalCouncilImage || '',
        medicalCertificateImage: pending.medicalCertificateImage || '',
        govIdImage: pending.govIdImage || '',
        updatedAt: ((doctor.updatedAt || doctor.verifiedAt) as { toString(): string })?.toString() || '',
        verificationStatus: doctor.verificationStatus as 'verified' | 'rejected',
    }
}

export const toPendingCaregiverDTO = (caregiver: RawRecord): PendingCaregiver => {
    return {
        _id: (caregiver._id as { toString(): string })?.toString() || '',
        name: caregiver.name || '',
        email: caregiver.email || '',
        profileImage: caregiver.profileImage || '',
        certificateNumber: (caregiver.certificateNumber as string) || '',
        licenseNumber: (caregiver.licenseNumber as string) || '',
        certificateImage: (caregiver.certificateImage as string) || '',
        licenseImage: (caregiver.licenseImage as string) || '',
        govIdImage: (caregiver.govIdImage as string) || '',
        createdAt: (caregiver.createdAt as { toString(): string })?.toString() || '',
        verificationStatus: caregiver.verificationStatus as 'verified' | 'rejected' | 'pending',
    }
}

export const toRecentCaregiverDTO = (caregiver: RawRecord): RecentCaregiver => {
    return {
        ...toPendingCaregiverDTO(caregiver),
        updatedAt: ((caregiver.updatedAt || caregiver.verifiedAt) as { toString(): string })?.toString() || '',
        verificationStatus: caregiver.verificationStatus as 'verified' | 'rejected',
    }
}

export const toAdminUserProfileDTO = (user: RawRecord): AdminUserProfile => {
    return {
        _id: (user._id as { toString(): string })?.toString() || '',
        name: user.name || '',
        email: user.email || '',
        role: user.role as 'doctor' | 'caregiver' | 'patient',
        isActive: !!user.isActive,
        createdAt: (user.createdAt as { toString(): string })?.toString() || '',
        profileImage: user.profileImage || '',
    }
}

export const toPlatformSettingsDTO = (settings: RawRecord): PlatformSettings => {
    return {
        platformName: (settings.platformName as string) || '',
        contactEmail: (settings.contactEmail as string) || '',
        address: (settings.address as string) || '',
        platformFee: (settings.platformFee as number) || 0,
        platformLogo: (settings.platformLogo as string) || '',
        platformIcon: (settings.platformIcon as string) || '',
    }
}
