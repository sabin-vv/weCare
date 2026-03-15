import { NextFunction, Request, Response } from 'express'
import { ZodType } from 'zod'

import { AppError } from '../utils/AppError'

export const validate = (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
        const message = result.error.issues[0].message
        return next(new AppError(400, message))
    }

    next()
}
