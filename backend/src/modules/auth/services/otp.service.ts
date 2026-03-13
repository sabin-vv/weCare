import { AppError } from '../../../utils/AppError'
import { OtpRepository } from '../repositories/auth.repository'
import { DoctorRepository } from '../repositories/doctor.repository'
import { generateOtp, sendEmail } from './auth.service'

export class OtpService {
    constructor(
        private otpRepository: OtpRepository,
        private doctorRepository: DoctorRepository,
    ) {}
    async sendOtp(email: string) {
        const emailExist = await this.doctorRepository.findByEmail(email)
        if (emailExist) {
            throw new AppError(400, 'Email already exist')
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
}
