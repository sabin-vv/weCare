import { NextFunction, Request, Response } from 'express'

import { AppError } from '../../../utils/AppError'
import { generateAccessToken, verifyRefreshToken } from '../../../utils/jwt'
import { Login, ResetPasswordRequest } from '../interfaces/authInterface'
import { AuthService } from '../services/auth.service'

export class AuthController {
    constructor(private authService: AuthService) {}

    login = async (req: Request<unknown, unknown, Login>, res: Response, next: NextFunction) => {
        try {
            const { email, password, role } = req.body
            const result = await this.authService.login(email, password, role)

            res.cookie('accessToken', result.accessToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
            })
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
            })
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
    refreshToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { token } = req.body

            if (!token) {
                throw new AppError(401, 'Refresh token required')
            }
            const decoded = verifyRefreshToken(token)

            const newAccessToken = generateAccessToken({
                userId: decoded.userId,
                role: decoded.role,
            })
            res.json({
                success: true,
                accessToken: newAccessToken,
            })
        } catch (error) {
            next(error)
        }
    }

    logout = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            res.clearCookie('accessToken')
            res.clearCookie('refreshToken')

            res.status(200).json({
                success: true,
                message: 'Logged out successfully',
            })
        } catch (error) {
            next(error)
        }
    }
}
