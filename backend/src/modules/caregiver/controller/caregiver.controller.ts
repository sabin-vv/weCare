import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { ICaregiverService } from '../interfaces/caregiver.service.interface'

@injectable()
export class CaregiverController {
    constructor(@inject(TOKENS.ICaregiverService) private caregiverService: ICaregiverService) {}

    registerCaregiver = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.caregiverService.registerCaregiver(req.body, {})
            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                data: result,
                message: 'Caregiver registered successfully',
            })
        } catch (error) {
            next(error)
        }
    }
}
