import { ResetPasswordDTO } from '../dto/resetPassword.dto'
import { LoginResponse, UserDocument, UserRole } from '../types/auth.types'
import { OtpRequestPurpose } from '../types/otp.types'
import { RegisterDTO } from '../validator/auth.schema'

export interface IAuthService {
    register(dto: RegisterDTO): Promise<UserDocument>
    sendOtp(email: string, purpose: OtpRequestPurpose): Promise<void>

    verifyOtp(email: string, otp: string): Promise<void>

    login(email: string, password: string, role: UserRole): Promise<LoginResponse>

    refreshToken(token: string): Promise<{ accessToken: string }>

    resetpassword(dto: ResetPasswordDTO): Promise<void>
}
