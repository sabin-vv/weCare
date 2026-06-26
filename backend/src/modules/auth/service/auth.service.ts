import bcrypt from 'bcrypt'
import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../../core/utils/jwt'
import { IAdminRepository } from '../../admin/interfaces/admin.repository.interface'
import { ICaregiverRepository } from '../../caregiver/interfaces/caregiver.repository.interface'
import { IDoctorRepository } from '../../doctor/interfaces/doctor.repository.interface'
import { IPatientRepository } from '../../patient/interfaces/patient.repository.interface'
import { MSG } from '../constants/messages'
import { IAuthService } from '../interfaces/auth.service.interface'
import { IUserRepository } from '../interfaces/user.repository.interface'
import { toUserEntity, toUserResponseDTO } from '../mapper/auth.mapper'
import { UserRole } from '../types/auth.types'
import { OtpRequestPurpose } from '../types/otp.types'
import { ChangePasswordDTO, RegisterDTO, ResetPasswordDTO } from '../validator/auth.schema'
import { OtpService } from './otp.service'

@injectable()
export class AuthService implements IAuthService {
    constructor(
        @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
        @inject(TOKENS.IDoctorRepository) private _doctorRepo: IDoctorRepository,
        @inject(TOKENS.ICaregiverRepository) private _caregiverRepo: ICaregiverRepository,
        @inject(TOKENS.IPatientRepository) private _patientRepo: IPatientRepository,
        @inject(TOKENS.IAdminRepository) private _adminRepo: IAdminRepository,
        @inject(TOKENS.IOtpService) private _otpService: OtpService,
    ) {}

    async register(dto: RegisterDTO) {
        const { confirmPassword: _confirmPassword, ...cleanDto } = dto

        const email = cleanDto.email.toLowerCase()
        const existing = await this._userRepo.findByEmail(email)

        if (existing) {
            throw new AppError(HTTP_STATUS.CONFLICT, MSG.USER_ALREADY_EXISTS)
        }

        const userData = await toUserEntity(dto, dto.role)

        const user = await this._userRepo.create({ ...userData, isProfileComplete: false })
        return toUserResponseDTO(user)
    }

    async sendOtp(email: string, purpose: OtpRequestPurpose) {
        const user = await this._userRepo.findByEmail(email)

        if (purpose === OtpRequestPurpose.REGISTER && user) {
            throw new AppError(HTTP_STATUS.CONFLICT, MSG.EMAIL_ALREADY_EXISTS)
        }

        if (purpose === OtpRequestPurpose.PASSWORD_RESET && !user) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.USER_NOT_FOUND)
        }
        await this._otpService.sendOtp(email, purpose)
    }

    async verifyOtp(email: string, otp: string) {
        await this._otpService.verifyOtp(email, otp)
    }

    async login(email: string, password: string, role: UserRole) {
        const user = await this._userRepo.findByEmail(email)

        if (!user) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.USER_NOT_FOUND)
        }
        if (!user.isActive) {
            throw new AppError(HTTP_STATUS.FORBIDDEN, MSG.ACCOUNT_DISABLED)
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.INVALID_CREDENTIALS)
        }
        if (role !== user.role) {
            throw new AppError(HTTP_STATUS.FORBIDDEN, MSG.ACCESS_DENIED)
        }

        const payload = {
            userId: user._id.toString(),
            role: user.role,
        }

        const accessToken = generateAccessToken(payload)
        const refreshToken = generateRefreshToken(payload)
        const profile = await this.getCurrentUser(user._id.toString(), user.role)

        return {
            user: toUserResponseDTO(user, profile),
            tokens: {
                accessToken,
                refreshToken,
            },
        }
    }

    async refreshToken(token: string): Promise<{ accessToken: string }> {
        if (!token) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.NO_REFRESH_TOKEN)
        }

        const decoded = verifyRefreshToken(token)

        const newAccessToken = generateAccessToken({ userId: decoded.userId, role: decoded.role })

        return { accessToken: newAccessToken }
    }

    async resetPassword(dto: ResetPasswordDTO): Promise<void> {
        const { email, newPassword } = dto

        const user = await this._userRepo.findByEmail(email)

        if (!user) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.USER_NOT_FOUND)
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await this._userRepo.updatePassword(user._id, hashedPassword)
    }

    async changePassword(userId: string, dto: ChangePasswordDTO): Promise<void> {
        const { currentPassword, newPassword } = dto

        const user = await this._userRepo.findById(userId)

        if (!user) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.USER_NOT_FOUND)
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password)
        if (!isMatch) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.INCORRECT_PASSWORD)
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await this._userRepo.updatePassword(user._id, hashedPassword)
    }

    async getCurrentUser(userId: string, role: UserRole) {
        const user = await this._userRepo.findById(userId)

        if (!user) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.USER_NOT_FOUND)
        }

        let profileImage: string | undefined
        let professionalTitle: string | undefined
        let verificationStatus: string | undefined

        switch (role) {
            case UserRole.DOCTOR:
                const doctor = await this._doctorRepo.findByUserId(new Types.ObjectId(userId))
                verificationStatus = doctor?.verificationStatus
                profileImage = doctor?.profileImage
                professionalTitle = doctor?.specializations?.[0]?.name
                break
            case UserRole.CAREGIVER:
                const caregiver = await this._caregiverRepo.findByUserId(new Types.ObjectId(userId))
                verificationStatus = caregiver?.verificationStatus
                profileImage = caregiver?.profileImage
                break
            case UserRole.PATIENT:
                const patient = await this._patientRepo.findByUserId(new Types.ObjectId(userId))
                profileImage = patient?.profileImage
                break
            case UserRole.ADMIN:
                const admin = await this._adminRepo.findByUserId(userId)
                profileImage = admin?.profileImage
                break
        }

        return {
            verificationStatus,
            profileImage,
            professionalTitle,
        }
    }
}
