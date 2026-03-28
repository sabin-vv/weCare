import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { env } from '../../../core/config/env'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { IAuthService } from '../interfaces/auth.service.interface'
import { MulterFiles } from '../types/auth.types'

const isProduction = env.NODE_ENV === 'production'

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
}

@injectable()
export class AuthController {
    constructor(@inject(TOKENS.IAuthService) private authService: IAuthService) {}

    sendOtp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, purpose } = req.body
            await this.authService.sendOtp(email, purpose)
            res.status(HTTP_STATUS.OK).json({ success: true, message: 'OTP send successfully' })
        } catch (error) {
            next(error)
        }
    }

    verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, otp } = req.body

            await this.authService.verifyOtp(email, otp)
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'OTP verified Successfuly',
            })
        } catch (error) {
            next(error)
        }
    }

    registerDoctor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.authService.registerDoctor(req.body, req.files as MulterFiles)

            res.status(HTTP_STATUS.CREATED).json({ success: true, data: result })
        } catch (error) {
            next(error)
        }
    }

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password, role } = req.body
            const result = await this.authService.login(email, password, role)

            const { accessToken, refreshToken } = result.tokens

            res.cookie('accessToken', accessToken, cookieOptions)
            res.cookie('refreshToken', refreshToken, cookieOptions)

            res.status(HTTP_STATUS.OK).json({ success: true, data: result.user })
        } catch (error) {
            next(error)
        }
    }
    refreshToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.cookies?.refreshToken
            const { accessToken } = await this.authService.refreshToken(refreshToken)

            res.cookie('accessToken', accessToken)

            res.status(HTTP_STATUS.OK).json({ success: true, message: 'Access token refreshed successfully' })
        } catch (error) {
            next(error)
        }
    }
    resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.authService.resetpassword(req.body)

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Password reset successfully',
            })
        } catch (error) {
            next(error)
        }
    }

    logout = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            res.clearCookie('accessToken', cookieOptions)
            res.clearCookie('refreshToken', cookieOptions)

            res.status(HTTP_STATUS.OK).json({ success: true, message: 'Logged out successfully' })
        } catch (error) {
            next(error)
        }
    }
}
