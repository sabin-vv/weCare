import { NextFunction, Request, Response } from 'express'

import { AppError } from '../errors/AppError'

export const errorMiddleware = (err: Error, req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ success: false, message: err.message })
    }
    if (err instanceof Error) {
        return res.status(500).json({ success: false, message: err.message })
    }
    return res.status(500).json({
        success: false,
        message: 'Internal server error',
    })
}
