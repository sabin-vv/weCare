import { NextFunction, Request, Response } from 'express'

import { HTTP_STATUS } from '../constants/httpStatus'
import { AppError } from '../errors/AppError'
import { verifyAccessToken } from '../utils/jwt'

type AdminUser = { userId: string; role: string }

export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken

    if (!token) {
        return next(new AppError(HTTP_STATUS.UNAUTHORIZED, 'No access token'))
    }

    try {
        const decoded = verifyAccessToken(token)

        if (decoded.role !== 'admin') {
            return next(new AppError(HTTP_STATUS.FORBIDDEN, 'Access denied'))
        }

        ;(req as Request & { user?: AdminUser }).user = { userId: decoded.userId, role: decoded.role }
        next()
    } catch {
        return next(new AppError(HTTP_STATUS.UNAUTHORIZED, 'Invalid access token'))
    }
}
