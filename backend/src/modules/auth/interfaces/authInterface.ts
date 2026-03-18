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

export interface ResetPasswordRequest {
    email: string
    password: string
}
