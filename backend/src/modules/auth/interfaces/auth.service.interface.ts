import { ResetPasswordDTO } from '../dto/resetPassword.dto'
import { LoginResponse, UserRole } from '../types/auth.types'
import { OtpRequestPurpose } from '../types/otp.types'

export interface IAuthService {
    sendOtp(email: string, purpose: OtpRequestPurpose): Promise<void>

    verifyOtp(email: string, otp: string): Promise<void>

    login(email: string, password: string, role: UserRole): Promise<LoginResponse>

    refreshToken(token: string): Promise<{ accessToken: string }>

    resetpassword(dto: ResetPasswordDTO): Promise<void>
}
