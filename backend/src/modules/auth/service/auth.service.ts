import bcrypt from 'bcrypt'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { generateAccessToken, generateRefreshToken } from '../../../core/utils/jwt'
import { IDoctorRepository } from '../../doctor/interfaces/doctor.repository.interface'
import { toDoctorEntity } from '../../doctor/mapper/doctor.mapper'
import { RegisterDoctorDTO } from '../dto/registerDoctor.dto'
import { IAuthService } from '../interfaces/auth.service.interface'
import { IUserRepository } from '../interfaces/user.repository.interface'
import { toUserEntity } from '../mapper/auth.mapper'
import { MulterFiles, UserRole } from '../types/auth.types'
import { OtpRequestPurpose } from '../types/otp.types'
import { OtpService } from './otp.service'

@injectable()
export class AuthService implements IAuthService {
    constructor(
        @inject(TOKENS.IUserRepository) private userRepo: IUserRepository,
        @inject(TOKENS.IDoctorRepository) private doctorRepo: IDoctorRepository,
        @inject(TOKENS.IOtpService) private otpService: OtpService,
    ) {}

    async registerDoctor(dto: RegisterDoctorDTO, files: MulterFiles) {
        const existing = await this.userRepo.findByEmail(dto.email)

        if (existing) throw new AppError(HTTP_STATUS.BAD_REQUEST, 'User already exist')

        const userData = await toUserEntity(dto)
        const user = await this.userRepo.create(userData)

        const doctorData = toDoctorEntity(user._id, dto, files)

        return this.doctorRepo.create(doctorData)
    }

    async sendOtp(email: string, purpose: OtpRequestPurpose) {
        const user = await this.userRepo.findByEmail(email)

        if (purpose === OtpRequestPurpose.REGISTER && user) {
            throw new AppError(HTTP_STATUS.CONFLICT, 'Email already exist')
        }

        if (purpose === OtpRequestPurpose.PASSWORD_RESET && !user) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found')
        }
        await this.otpService.sendOtp(email, purpose)
    }

    async verifyOtp(email: string, otp: string) {
        await this.otpService.verifyOtp(email, otp)
    }

    async login(email: string, password: string, role: UserRole) {
        const user = await this.userRepo.findByEmail(email)

        if (!user) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found')
        }
        if (!user.isActive) {
            throw new AppError(HTTP_STATUS.FORBIDDEN, 'Your account has been temporarily disabled')
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Something went wrong')
        }
        if (role !== user.role) {
            throw new AppError(HTTP_STATUS.FORBIDDEN, 'Access denied')
        }
        if (user.role === 'doctor') {
            const doctor = await this.doctorRepo.findByUserId(user._id)

            if (!doctor) {
                throw new AppError(HTTP_STATUS.FORBIDDEN, 'Doctor profile not found')
            }

            if (doctor.verificationStatus === 'pending') {
                throw new AppError(HTTP_STATUS.FORBIDDEN, 'Your account is under review')
            }

            if (doctor.verificationStatus === 'rejected') {
                throw new AppError(HTTP_STATUS.FORBIDDEN, 'Your application was rejected')
            }
        }

        const payload = {
            userId: user._id.toString(),
            role: user.role,
        }

        const accessToken = generateAccessToken(payload)
        const refreshToken = generateRefreshToken(payload)

        return {
            user: {
                user: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            tokens: {
                accessToken,
                refreshToken,
            },
        }
    }
}
