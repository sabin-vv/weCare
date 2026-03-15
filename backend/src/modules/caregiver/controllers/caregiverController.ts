import { NextFunction, Request, Response } from 'express'

import { caregiverRegister } from '../interfaces/caregiverIneterface'
import { CaregiverService } from '../services/caregiver.service'

export class CaregiverController {
    constructor(private caregiverService: CaregiverService) {}

    registerCaregiver = async (
        req: Request<unknown, unknown, caregiverRegister>,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            console.log('point 1')
            const files = req.files as Record<string, Express.Multer.File[]>

            const result = await this.caregiverService.registerCaregiver(req.body, files)

            return res.status(201).json(result)
        } catch (error) {
            next(error)
        }
    }
}
