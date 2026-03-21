export interface IOtp {
    email: string
    otp: string
    expiredAt: Date
}

export enum OtpRequestPurpose {
    EMAIL_VERIFICATION = 'email-verification',
    PASSWORD_RESET = 'password-reset',
    ACCOUNT_RECOVERY = 'account-recovery',
}

export interface OtpRequest {
    email: string
    purpose: OtpRequestPurpose
}
export interface VerifyOtp {
    email: string
    otp: string
}

export type Role = 'doctor' | 'caregiver' | 'patient' | 'admin'

export interface ResetPasswordRequest {
    email: string
    password: string
}
export interface Login extends ResetPasswordRequest {
    role: Role
}

export interface Payload {
    userId: string
    role: string
}
