import { NextFunction, Request, Response } from 'express'

import { HTTP_STATUS } from '../constants/httpStatus'
import { AppError } from '../errors/AppError'
import { verifyAccessToken } from '../utils/jwt'

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken

    if (!token) {
        return next(new AppError(HTTP_STATUS.UNAUTHORIZED, 'No access token'))
    }

    try {
        const decoded = verifyAccessToken(token)
        req.user = decoded
        next()
    } catch {
        return next(new AppError(HTTP_STATUS.UNAUTHORIZED, 'Invalid access token'))
    }
}
