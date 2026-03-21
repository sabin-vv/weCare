import { NextFunction, Request, Response } from 'express'

import { OtpRequest, VerifyOtp } from '../interfaces/authInterface'
import { OtpService } from '../services/otp.service'

export class OtpController {
    constructor(private otpService: OtpService) {}

    sendOtp = async (req: Request<unknown, unknown, OtpRequest>, res: Response, next: NextFunction) => {
        try {
            const { email, purpose } = req.body
            const result = await this.otpService.sendOtp(email, purpose)
            return res.status(200).json(result)
        } catch (error) {
            next(error)
        }
    }

    verifyOtp = async (req: Request<unknown, unknown, VerifyOtp>, res: Response, next: NextFunction) => {
        try {
            const { email, otp } = req.body
            const result = await this.otpService.verifyOtp(email, otp)
            return res.status(200).json(result)
        } catch (error) {
            next(error)
        }
    }
}
