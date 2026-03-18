import { NextFunction, Request, Response } from 'express'

import { AppError } from '../utils/AppError'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
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
