import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { env } from '../../../core/config/env'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { IAuthService } from '../interfaces/auth.service.interface'
import { UserRole } from '../types/auth.types'

const isProduction = env.NODE_ENV === 'production'

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
}

@injectable()
export class AuthController {
    constructor(@inject(TOKENS.IAuthService) private _authService: IAuthService) {}

    register = async (req: Request, res: Response) => {
        const { confirmPassword: _confirmPassword, ...cleanDto } = req.body
        const result = await this._authService.register(cleanDto)

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'User created successfully',
            data: result,
        })
    }

    sendOtp = async (req: Request, res: Response) => {
        const { email, purpose } = req.body

        await this._authService.sendOtp(email, purpose)

        res.status(HTTP_STATUS.OK).json({ success: true, message: 'OTP send successfully' })
    }

    verifyOtp = async (req: Request, res: Response) => {
        const { email, otp } = req.body

        await this._authService.verifyOtp(email, otp)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'OTP verified Successfuly',
        })
    }

    login = async (req: Request, res: Response) => {
        const { email, password, role } = req.body

        const result = await this._authService.login(email, password, role)

        const { accessToken, refreshToken } = result.tokens

        res.cookie('accessToken', accessToken, cookieOptions)
        res.cookie('refreshToken', refreshToken, cookieOptions)

        res.status(HTTP_STATUS.OK).json({ success: true, message: 'Login successfull', data: result.user })
    }

    refreshToken = async (req: Request, res: Response) => {
        const refreshToken = req.cookies?.refreshToken
        const { accessToken } = await this._authService.refreshToken(refreshToken)

        res.cookie('accessToken', accessToken, cookieOptions)

        res.status(HTTP_STATUS.OK).json({ success: true, message: 'Access token refreshed successfully' })
    }

    resetPassword = async (req: Request, res: Response) => {
        await this._authService.resetpassword(req.body)

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

    getCurrentUser = async (req: Request, res: Response) => {
        const userId = req?.user?.userId
        const role = req?.user?.role as UserRole

        const user = await this._authService.getCurrentUser(userId!, role)

        res.status(HTTP_STATUS.OK).json({ success: true, data: user })
    }

    changePassword = async (req: Request, res: Response) => {
        const userId = req?.user?.userId

        await this._authService.changePassword(userId!, req.body)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Password changed successfully',
        })
    }
}
