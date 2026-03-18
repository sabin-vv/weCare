import { NextFunction, Request, Response } from 'express'

import { OtpRequest, ResetPasswordRequest, VerifyOtp } from '../interfaces/authInterface'
import { AuthService } from '../services/otp.service'

export class AuthController {
    constructor(private authService: AuthService) {}
    sendOtp = async (req: Request<unknown, unknown, OtpRequest>, res: Response, next: NextFunction) => {
        try {
            const { email, purpose } = req.body

            const result = await this.authService.sendOtp(email, purpose)

            return res.status(200).json(result)
        } catch (error) {
            next(error)
        }
    }
    verifyOtp = async (req: Request<unknown, unknown, VerifyOtp>, res: Response, next: NextFunction) => {
        try {
            const { email, otp } = req.body
            const result = await this.authService.verifyOtp(email, otp)
            return res.status(200).json(result)
        } catch (error) {
            next(error)
        }
    }

    resetPassword = async (req: Request<unknown, unknown, ResetPasswordRequest>, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body
            const result = await this.authService.resetPassword(email, password)
            return res.status(200).json(result)
        } catch (error) {
            next(error)
        }
    }
}
