import { AppError } from '../../../core/errors/AppError'
import { MulterFiles } from '../../../types/user.model.types'
import { toDoctorEntity } from '../../doctor/mapper/doctor.mapper'
import { IDoctorRepository } from '../../doctor/repository/interface/doctor.repository.interface'
import { RegisterDoctorDTO } from '../dto/registerDoctor.dto'
import { toUserEntity } from '../mapper/auth.mapper'
import { IUserRepository } from '../repository/interface/user.repository.interface'

export class AuthService {
    constructor(
        private userRepo: IUserRepository,
        private doctorRepo: IDoctorRepository,
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
