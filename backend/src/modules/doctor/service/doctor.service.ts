import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IUserRepository } from '../../auth/interfaces/user.repository.interface'
import { toUserEntity } from '../../auth/mapper/auth.mapper'
import { MulterFiles, UserRole } from '../../auth/types/auth.types'
import { IDoctorRepository } from '../interfaces/doctor.repository.interface'
import { IDoctorService } from '../interfaces/doctor.service.interface'
import { toDoctorEntity } from '../mapper/doctor.mapper'
import { RegisterDoctorDTO } from '../validator/registerDoctor.schema'

@injectable()
export class DoctorService implements IDoctorService {
    constructor(
        @inject(TOKENS.IUserRepository) private userRepo: IUserRepository,
        @inject(TOKENS.IDoctorRepository) private doctorRepo: IDoctorRepository,
    ) {}

    async registerDoctor(dto: RegisterDoctorDTO, files: MulterFiles) {
        const existing = await this.userRepo.findByEmail(dto.email)
        if (existing) throw new AppError(HTTP_STATUS.BAD_REQUEST, 'User already exist')

        const userData = await toUserEntity(dto, UserRole.DOCTOR)
        const user = await this.userRepo.create(userData)

        const doctorData = toDoctorEntity(user._id, dto, files)
        return this.doctorRepo.create(doctorData)
    }
}
