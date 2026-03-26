import { NextFunction, Request, Response } from 'express'
import { ZodType } from 'zod'

import { AppError } from '../errors/AppError'

export const validate = (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
        const message = result.error.issues.map((e) => e.message).join(', ')
        throw new AppError(400, message)
    }

    req.body = result.data
    next()
}
