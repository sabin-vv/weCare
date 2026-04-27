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
        name: user.name,
        email: user.email,
        mobile: user.mobile,

        govIdImage: doctor.govIdImage,
        profileImage: doctor.profileImage,
        professionalTitle: doctor.specializations.map((s) => s.name).join(','),
        consultationFee: doctor.consultationFee ?? 0,

        medicalCertificateNumber: doctor.medicalCertificateNumber,
        medicalCertificateImage: doctor.medicalCertificateImage,
        medicalCouncilRegistrationNumber: doctor.medicalCouncilRegisterNumber,
        medicalCouncilImage: doctor.medicalCouncilImage,

        specialization: doctor.specializations.map((spec) => ({ name: spec.name, documentImage: spec.documentImage })),

        isActive: doctor.isActive,
        verificationStatus: doctor.verificationStatus,
        rejectReason: doctor.rejectReason,
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
