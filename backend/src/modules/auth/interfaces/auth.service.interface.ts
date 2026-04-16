import { LoginResponse, UserDocument, UserRole } from '../types/auth.types'
import { OtpRequestPurpose } from '../types/otp.types'
import { ChangePasswordDTO, ResetPasswordDTO } from '../validator/auth.schema'
import { RegisterDTO } from '../validator/auth.schema'

export interface IAuthService {
    register(dto: RegisterDTO): Promise<UserDocument>
    sendOtp(email: string, purpose: OtpRequestPurpose): Promise<void>

    verifyOtp(email: string, otp: string): Promise<void>

    login(email: string, password: string, role: UserRole): Promise<LoginResponse>

    refreshToken(token: string): Promise<{ accessToken: string }>

    resetpassword(dto: ResetPasswordDTO): Promise<void>

    changePassword(userId: string, dto: ChangePasswordDTO): Promise<void>

    getCurrentUser(
        userId: string,
        role: UserRole,
    ): Promise<{
        verificationStatus?: string
        profileImage?: string
        specialization?: string
    }>
}
