import { NextFunction, Request, Response } from 'express'

import { updatedRegisterDoctor } from '../interfaces/doctorInterface'
import { DoctorService } from '../services/doctor.services'

export class DoctorController {
    constructor(private doctorService: DoctorService) {}

    registerDoctor = async (
        req: Request<unknown, unknown, updatedRegisterDoctor>,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const files = req.files as Express.Multer.File[]
            const result = await this.doctorService.registerDoctor(req.body, files)

            return res.status(201).json(result)
        } catch (error) {
            next(error)
        }
    }
}
