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
import { IAuthService } from '../interfaces/auth.service.interface'
import { IUserRepository } from '../interfaces/user.repository.interface'
import { toUserEntity } from '../mapper/auth.mapper'
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
            throw new AppError(HTTP_STATUS.CONFLICT, 'User already exist')
        }

        const userData = await toUserEntity(dto, dto.role)

        return await this._userRepo.create({ ...userData, isProfileComplete: false })
    }

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
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Invalid credentials')
        }
        if (role !== user.role) {
            throw new AppError(HTTP_STATUS.FORBIDDEN, 'Access denied')
        }

        const payload = {
            userId: user._id.toString(),
            role: user.role,
        }

        const accessToken = generateAccessToken(payload)
        const refreshToken = generateRefreshToken(payload)
        const profile = await this.getCurrentUser(user._id.toString(), user.role)

        return {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isProfileComplete: user.isProfileComplete,
                profileImage: profile.profileImage,
                specialization: profile.specialization,
                verificationStatus: profile.verificationStatus,
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

    async changePassword(userId: string, dto: ChangePasswordDTO): Promise<void> {
        const { currentPassword, newPassword } = dto

        const user = await this._userRepo.findById(userId)

        if (!user) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found')
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password)
        if (!isMatch) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Current password is incorrect')
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await this._userRepo.updatePassword(user._id, hashedPassword)
    }

    async getCurrentUser(userId: string, role: UserRole) {
        const user = await this._userRepo.findById(userId)

        if (!user) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found')
        }

        let profileImage: string | undefined
        let specialization: string | undefined
        let verificationStatus: string | undefined

        switch (role) {
            case UserRole.DOCTOR:
                const doctor = await this._doctorRepo.findByUserId(new Types.ObjectId(userId))
                verificationStatus = doctor?.verificationStatus
                profileImage = doctor?.profileImage
                specialization = doctor?.specializations?.[0]?.name
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
            specialization,
        }
    }
}
