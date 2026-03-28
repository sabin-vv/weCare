import { DoctorDocument } from '../../doctor/types/doctor.types'
import { RegisterDoctorDTO } from '../dto/registerDoctor.dto'
import { LoginResponse, MulterFiles, UserRole } from '../types/auth.types'
import { OtpRequestPurpose } from '../types/otp.types'

export interface IAuthService {
    registerDoctor(dto: RegisterDoctorDTO, files: MulterFiles): Promise<DoctorDocument>

    sendOtp(email: string, purpose: OtpRequestPurpose): Promise<void>

    verifyOtp(email: string, otp: string): Promise<void>

    login(email: string, password: string, role: UserRole): Promise<LoginResponse>

    refreshToken(token: string): Promise<{ accessToken: string }>
}
