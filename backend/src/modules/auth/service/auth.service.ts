import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { AppError } from '../../../core/errors/AppError'
import { IDoctorRepository } from '../../doctor/interfaces/doctor.repository.interface'
import { toDoctorEntity } from '../../doctor/mapper/doctor.mapper'
import { RegisterDoctorDTO } from '../dto/registerDoctor.dto'
import { IAuthService } from '../interfaces/auth.service.interface'
import { IUserRepository } from '../interfaces/user.repository.interface'
import { toUserEntity } from '../mapper/auth.mapper'
import { MulterFiles } from '../types/auth.types'

@injectable()
export class AuthService implements IAuthService {
    constructor(
        @inject(TOKENS.IUserRepository) private userRepo: IUserRepository,
        @inject(TOKENS.IDoctorRepository) private doctorRepo: IDoctorRepository,
    ) {}

    async registerDoctor(dto: RegisterDoctorDTO, files: MulterFiles) {
        const existing = await this.userRepo.findByEmail(dto.email)

        if (existing) throw new AppError(400, 'User already exist')

        const userData = await toUserEntity(dto)
        const user = await this.userRepo.create(userData)

        const doctorData = toDoctorEntity(user._id, dto, files)

        return this.doctorRepo.create(doctorData)
    }
}
