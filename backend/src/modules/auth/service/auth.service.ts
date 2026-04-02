import bcrypt from 'bcrypt'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../../core/utils/jwt'
import { IDoctorRepository } from '../../doctor/interfaces/doctor.repository.interface'
import { ResetPasswordDTO } from '../dto/resetPassword.dto'
import { IAuthService } from '../interfaces/auth.service.interface'
import { IUserRepository } from '../interfaces/user.repository.interface'
import { UserRole } from '../types/auth.types'
import { OtpRequestPurpose } from '../types/otp.types'
import { OtpService } from './otp.service'

@injectable()
export class AuthService implements IAuthService {
    constructor(
        @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
        @inject(TOKENS.IDoctorRepository) private _doctorRepo: IDoctorRepository,
        @inject(TOKENS.IOtpService) private _otpService: OtpService,
    ) {}

    async sendOtp(email: string, purpose: OtpRequestPurpose) {
        const user = await this._userRepo.findByEmail(email)

        if (purpose === OtpRequestPurpose.REGISTER && user) {
            throw new AppError(HTTP_STATUS.CONFLICT, 'Email already exist')
        }

        if (purpose === OtpRequestPurpose.PASSWORD_RESET && !user) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found')
        }
        await this._otpService.sendOtp(email, purpose)
    }

    async verifyOtp(email: string, otp: string) {
        await this._otpService.verifyOtp(email, otp)
    }

    async login(email: string, password: string, role: UserRole) {
        const user = await this._userRepo.findByEmail(email)

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
            const doctor = await this._doctorRepo.findByUserId(user._id)

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
                id: user._id,
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

    async refreshToken(token: string): Promise<{ accessToken: string }> {
        if (!token) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'No refresh token')
        }

        const decoded = verifyRefreshToken(token)

        const newAccessToken = generateAccessToken({ userId: decoded.userId, role: decoded.role })

        return { accessToken: newAccessToken }
    }

    async resetpassword(dto: ResetPasswordDTO): Promise<void> {
        const { email, newPassword } = dto

        const user = await this._userRepo.findByEmail(email)

        if (!user) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found')
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await this._userRepo.updatePassword(user._id, hashedPassword)
    }
}
