export interface IOtp {
    email: string
    otp: string
    expiredAt: Date
}

export interface ISendOtp {
    email: string
}
export interface IverifyOtp {
    email: string
    otp: string
}
