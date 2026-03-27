import { OtpRequestPurpose } from '../types/otp.types'

export interface IOtpService {
    sendOtp(email: string, purpose: OtpRequestPurpose): Promise<void>

    verifyOtp(email: string, otp: string): Promise<void>
}
