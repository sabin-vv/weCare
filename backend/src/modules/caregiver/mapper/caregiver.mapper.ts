import { Types } from 'mongoose'

import { MulterFiles } from '../../auth/types/auth.types'
import { CaregiverEntity } from '../types/caregiver.types'
import { RegisterCaregiverDTO } from '../validator/caregiver.schema'

export const toCaregiverEntity = (userId: Types.ObjectId, dto: RegisterCaregiverDTO, files: MulterFiles): CaregiverEntity => {
    const fromDtoOrFile = (dtoValue: string | undefined, fileField: string) => {
        return dtoValue ?? files?.[fileField]?.[0]?.originalname ?? ''
    }

    return {
        userId,
        certificateNumber: dto.certificateNumber,
        licenseNumber: dto.licenseNumber,

        govIdImage: fromDtoOrFile(dto.govIdImage, 'govIdImage'),
        profileImage: fromDtoOrFile(dto.profileImage, 'profileImage'),
        certificateImage: fromDtoOrFile(dto.certificateImage, 'certificateImage'),
        licenseImage: fromDtoOrFile(dto.licenseImage, 'licenseImage'),
    }
}
