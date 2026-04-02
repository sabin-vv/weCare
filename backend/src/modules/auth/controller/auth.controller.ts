import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { env } from '../../../core/config/env'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { IAuthService } from '../interfaces/auth.service.interface'

const isProduction = env.NODE_ENV === 'production'

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
}

@injectable()
export class AuthController {
    constructor(@inject(TOKENS.IAuthService) private authService: IAuthService) {}

    sendOtp = async (req: Request, res: Response) => {
        const { email, purpose } = req.body

        await this.authService.sendOtp(email, purpose)

        res.status(HTTP_STATUS.OK).json({ success: true, message: 'OTP send successfully' })
    }

    verifyOtp = async (req: Request, res: Response) => {
        const { email, otp } = req.body

        await this.authService.verifyOtp(email, otp)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'OTP verified Successfuly',
        })
    }

    login = async (req: Request, res: Response) => {
        const { email, password, role } = req.body

        const result = await this.authService.login(email, password, role)

        const { accessToken, refreshToken } = result.tokens

        res.cookie('accessToken', accessToken, cookieOptions)
        res.cookie('refreshToken', refreshToken, cookieOptions)

        res.status(HTTP_STATUS.OK).json({ success: true, data: result.user })
    }

    refreshToken = async (req: Request, res: Response) => {
        const refreshToken = req.cookies?.refreshToken
        const { accessToken } = await this.authService.refreshToken(refreshToken)

        res.cookie('accessToken', accessToken, cookieOptions)

        res.status(HTTP_STATUS.OK).json({ success: true, message: 'Access token refreshed successfully' })
    }

    resetPassword = async (req: Request, res: Response) => {
        await this.authService.resetpassword(req.body)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Password reset successfully',
        })
    }

    logout = async (_req: Request, res: Response) => {
        res.clearCookie('accessToken', cookieOptions)
        res.clearCookie('refreshToken', cookieOptions)

        res.status(HTTP_STATUS.OK).json({ success: true, message: 'Logged out successfully' })
    }
}
