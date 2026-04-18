import { Types } from 'mongoose'

import { MulterFiles, UserDocument } from '../../auth/types/auth.types'
import { CaregiverDocument, CaregiverEntity, CaregiverProfileResponse } from '../types/caregiver.types'
import { CreateCaregiverProfileDTO, RegisterCaregiverDTO } from '../validator/caregiver.schema'

export const toCaregiverEntity = (
    userId: Types.ObjectId,
    dto: RegisterCaregiverDTO | CreateCaregiverProfileDTO,
    files: MulterFiles,
): CaregiverEntity => {
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

export const toCaregiverProfileResponse = (
    user: UserDocument,
    caregiver: CaregiverDocument,
): CaregiverProfileResponse => {
    return {
        id: user._id.toString(),
        fullName: user.name,
        email: user.email,
        phoneNumber: user.mobile,
        profileImage: caregiver.profileImage,
        certificateNumber: caregiver.certificateNumber,
        licenseNumber: caregiver.licenseNumber,
        isActive: caregiver.isActive,
        verificationStatus: caregiver.verificationStatus,
    }
}
