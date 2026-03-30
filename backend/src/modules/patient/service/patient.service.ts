import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IUserRepository } from '../../auth/interfaces/user.repository.interface'
import { toUserEntity } from '../../auth/mapper/auth.mapper'
import { UserRole } from '../../auth/types/auth.types'
import { IPatientRepository } from '../interfaces/patient.repository.interface'
import { IPatientService } from '../interfaces/patient.service.interface'
import { toPatientEntity } from '../mapper/patient.mapper'
import { PatientDocument } from '../types/patient.types'
import { RegisterPatientDTO } from '../validator/patient.schema'

@injectable()
export class PatientService implements IPatientService {
    constructor(
        @inject(TOKENS.IUserRepository) private userRepo: IUserRepository,
        @inject(TOKENS.IPatientRepository) private patientRepo: IPatientRepository,
    ) {}

    async registerPatient(dto: RegisterPatientDTO): Promise<PatientDocument> {
        const existing = await this.userRepo.findByEmail(dto.email)
        if (existing) throw new AppError(HTTP_STATUS.BAD_REQUEST, 'User already exist')

        const userData = await toUserEntity(dto, UserRole.PATIENT)
        const user = await this.userRepo.create(userData)

        const patientData = toPatientEntity(user._id, dto)
        return this.patientRepo.create(patientData)
    }
}

