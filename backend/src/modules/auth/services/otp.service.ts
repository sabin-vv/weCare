import bcrypt from 'bcrypt'

import { AppError } from '../../../utils/AppError'
import { generateOtp, sendEmail } from '../../notification/email.service'
import { OtpRequestPurpose } from '../interfaces/authInterface'
import { OtpRepository } from '../repositories/auth.repository'
import { UserRepository } from '../repositories/user.repository'

export class AuthService {
    constructor(
        private otpRepository: OtpRepository,
        private userRepository: UserRepository,
    ) {}
    async sendOtp(email: string, purpose: OtpRequestPurpose) {
        const user = await this.userRepository.findByEmail(email)
        if (purpose === OtpRequestPurpose.EMAIL_VERIFICATION && user) {
            throw new AppError(400, 'Email already exist')
        }
        if (purpose === OtpRequestPurpose.PASSWORD_RESET && !user) {
            throw new AppError(404, 'Email not found')
        }

        const otp = generateOtp()

        await this.otpRepository.createOtp(email, otp)

        await sendEmail(email, otp)
        return {
            success: true,
            message: 'OTP send successfully',
        }
    }

    async verifyOtp(email: string, otp: string) {
        const otpData = await this.otpRepository.verifyOtp(email, otp)

        if (!otpData) {
            throw new AppError(400, 'Invalid OTP')
        }
        if (otpData.expiredAt < new Date()) {
            await this.otpRepository.deleteOtp(email)
            throw new AppError(400, 'OTP expired')
        }

        await this.otpRepository.deleteOtp(email)

        return {
            success: true,
            message: 'OTP verified',
        }
    }

    async resetPassword(email: string, password: string) {
        const user = await this.userRepository.findByEmail(email)
        if (!user) {
            throw new AppError(404, 'Email not found')
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        user.password = hashedPassword
        await user.save()
        return {
            success: true,
            message: 'Password changed successfully',
        }
    }
}
