import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { IDoctorService } from '../interfaces/doctor.service.interface'

@injectable()
export class DoctorController {
    constructor(@inject(TOKENS.IDoctorService) private doctorService: IDoctorService) {}

    registerDoctor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.doctorService.registerDoctor(req.body, {})
            res.status(HTTP_STATUS.CREATED).json({ success: true, data: result })
        } catch (error) {
            next(error)
        }
    }
}
