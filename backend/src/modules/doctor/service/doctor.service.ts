import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IUserRepository } from '../../auth/interfaces/user.repository.interface'
import { IDoctorRepository } from '../interfaces/doctor.repository.interface'
import { IDoctorService } from '../interfaces/doctor.service.interface'
import { toDoctorEntity, toDoctorProfileResponse } from '../mapper/doctor.mapper'
import { DoctorProfileResponse } from '../types/doctor.types'
import { DoctorDTO } from '../validator/registerDoctor.schema'
import { UpdateDoctorSettingsDTO } from '../validator/updateDoctorSettings.schema'

@injectable()
export class DoctorService implements IDoctorService {
    constructor(
        @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
        @inject(TOKENS.IDoctorRepository) private _doctorRepo: IDoctorRepository,
    ) {}

    async createProfile(userId: string, dto: DoctorDTO) {
        const existingDoctor = await this._doctorRepo.findByUserId(new Types.ObjectId(userId))
        if (existingDoctor) {
            throw new AppError(HTTP_STATUS.CONFLICT, 'Doctor profile already exists')
        }

        const doctorData = toDoctorEntity(new Types.ObjectId(userId), dto)

        const doctor = await this._doctorRepo.create(doctorData)
        await this._userRepo.update(userId, { isProfileComplete: true })

        return doctor
    }

    async getProfile(userId: string): Promise<DoctorProfileResponse> {
        const user = await this._userRepo.findById(userId)
        if (!user) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found')
        }

        const doctor = await this._doctorRepo.findByUserId(new Types.ObjectId(userId))
        if (!doctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Doctor profile not found')
        }

        return toDoctorProfileResponse(user, doctor)
    }

    async updateProfile(userId: string, dto: UpdateDoctorSettingsDTO): Promise<DoctorProfileResponse> {
        const existingDoctor = await this._doctorRepo.findByUserId(new Types.ObjectId(userId))
        if (!existingDoctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Doctor profile not found')
        }

        await this._userRepo.update(userId, {
            name: dto.fullName,
            email: dto.email,
            mobile: dto.phoneNumber,
        })

        const doctor = await this._doctorRepo.updateByUserId(new Types.ObjectId(userId), {
            consultationFee: dto.consultationFee,
            ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        })

        const updatedUser = await this._userRepo.findById(userId)
        if (!updatedUser) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found')
        }

        return toDoctorProfileResponse(updatedUser, doctor)
    }
}
