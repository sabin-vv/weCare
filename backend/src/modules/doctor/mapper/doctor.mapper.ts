import { Types } from 'mongoose'

import { UserDocument } from '../../auth/types/auth.types'
import { DoctorEntity } from '../types/doctor.types'
import { DoctorDocument, DoctorProfileResponse, DoctorSearchResult } from '../types/doctor.types'
import { DoctorDTO } from '../validator/registerDoctor.schema'

export const toDoctorEntity = (userId: Types.ObjectId, dto: DoctorDTO): DoctorEntity => {
    return {
        userId,
        medicalCertificateNumber: dto.medicalCertificateNumber,
        medicalCouncilRegisterNumber: dto.medicalCouncilRegisterNumber,

        specializations: dto.specializations.map((spec, index) => ({
            name: spec.name,
            documentImage: dto.specializationDocumentKeys?.[index] ?? '',
        })),

        govIdImage: dto.govIdImage ?? '',
        profileImage: dto.profileImage ?? '',
        medicalCertificateImage: dto.medicalCertificateImage ?? '',
        medicalCouncilImage: dto.medicalCouncilImage ?? '',
    }
}

export const toDoctorProfileResponse = (user: UserDocument, doctor: DoctorDocument): DoctorProfileResponse => {
    return {
        id: user._id.toString(),
        fullName: user.name,
        email: user.email,
        phoneNumber: user.mobile,
        profileImage: doctor.profileImage,
        professionalTitle: doctor.specializations?.[0]?.name,
        consultationFee: doctor.consultationFee ?? 0,
        medicalLicenseNumber: doctor.medicalCertificateNumber,
        medicalCouncilRegistrationNumber: doctor.medicalCouncilRegisterNumber,
        experienceCertificatesCount: doctor.specializations?.length ?? 0,
        isActive: doctor.isActive,
        verificationStatus: doctor.verificationStatus,
    }
}

export const toDoctorPublicResponse = (doctor: DoctorDocument, user: UserDocument | null): DoctorSearchResult => {
    const userName = user?.name || 'Unknown Doctor'
    return {
        id: doctor._id.toString(),
        name: userName,
        specialty: doctor.specializations.map((s) => s.name).join(', '),
        profileImage: doctor.profileImage,
    }
}
