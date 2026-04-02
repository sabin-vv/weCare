import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IUserRepository } from '../../auth/interfaces/user.repository.interface'
import { toUserEntity } from '../../auth/mapper/auth.mapper'
import { MulterFiles, UserRole } from '../../auth/types/auth.types'
import { ICaregiverRepository } from '../interfaces/caregiver.repository.interface'
import { ICaregiverService } from '../interfaces/caregiver.service.interface'
import { toCaregiverEntity } from '../mapper/caregiver.mapper'
import { RegisterCaregiverDTO } from '../validator/caregiver.schema'

@injectable()
export class CaregiverService implements ICaregiverService {
    constructor(
        @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
        @inject(TOKENS.ICaregiverRepository) private _caregiverRepo: ICaregiverRepository,
    ) {}

    async registerCaregiver(dto: RegisterCaregiverDTO, files: MulterFiles) {
        const existing = await this._userRepo.findByEmail(dto.email)
        if (existing) throw new AppError(HTTP_STATUS.BAD_REQUEST, 'User already exist')

        const userData = await toUserEntity(dto, UserRole.CAREGIVER)
        const user = await this._userRepo.create(userData)

        const caregiverData = toCaregiverEntity(user._id, dto, files)
        return this._caregiverRepo.create(caregiverData)
    }
}
