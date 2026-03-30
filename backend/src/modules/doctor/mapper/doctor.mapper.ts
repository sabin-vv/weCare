import { Types } from 'mongoose'

import { MulterFiles } from '../../auth/types/auth.types'
import { DoctorEntity } from '../types/doctor.types'
import { RegisterDoctorDTO } from '../validator/registerDoctor.schema'

export const toDoctorEntity = (userId: Types.ObjectId, dto: RegisterDoctorDTO, files: MulterFiles): DoctorEntity => {
    const specializationKeys = Object.keys(files || {})
        .filter((key) => key.startsWith('specializationDocument'))
        .sort()

    const fromDtoOrFile = (dtoValue: string | undefined, fileField: string) => {
        return dtoValue ?? files?.[fileField]?.[0]?.originalname ?? ''
    }

    return {
        userId,
        medicalCertificateNumber: dto.medicalCertificateNumber,
        medicalCouncilRegisterNumber: dto.medicalCouncilRegisterNumber,

        specializations: dto.specializations.map((spec, index) => ({
            name: spec.name,
            documentImage: dto.specializationDocumentKeys?.[index] ?? files?.[specializationKeys[index]]?.[0]?.originalname ?? '',
        })),

        govIdImage: fromDtoOrFile(dto.govIdImage, 'govIdImage'),
        profileImage: fromDtoOrFile(dto.profileImage, 'profileImage'),
        medicalCertificateImage: fromDtoOrFile(dto.medicalCertificateImage, 'medicalCertificateImage'),
        medicalCouncilImage: fromDtoOrFile(dto.medicalCouncilImage, 'medicalCouncilImage'),
    }
}
