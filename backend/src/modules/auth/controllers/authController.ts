import { NextFunction, Request, Response } from 'express'

import { ISendOtp, IverifyOtp } from '../interfaces/authInterface'
import { OtpService } from '../services/otp.service'

export class AuthController {
    constructor(private otpService: OtpService) {}
    async sendOtp(req: Request<unknown, unknown, ISendOtp>, res: Response, next: NextFunction) {
        try {
            const { email } = req.body

            const result = await this.otpService.sendOtp(email)

            return res.status(200).json(result)
        } catch (error) {
            next(error)
        }
    }
    async verifyOtp(req: Request<unknown, unknown, IverifyOtp>, res: Response, next: NextFunction) {
        try {
            const { email, otp } = req.body
            const result = await this.otpService.verifyOtp(email, otp)
            return res.status(200).json(result)
        } catch (error) {
            next(error)
        }
    }
}
