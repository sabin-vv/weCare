import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { IAuthService } from '../interfaces/auth.service.interface'
import { MulterFiles } from '../types/auth.types'

@injectable()
export class AuthController {
    constructor(@inject(TOKENS.IAuthService) private authService: IAuthService) {}

    registerDoctor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.authService.registerDoctor(req.body, req.files as MulterFiles)

            res.status(201).json({ success: true, data: result })
        } catch (error) {
            next(error)
        }
    }
}
