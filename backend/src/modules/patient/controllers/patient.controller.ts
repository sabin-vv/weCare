import { NextFunction, Request, Response } from 'express'

import { PatientRegisterRequest } from '../interfaces/patientInterfaces'
import { PatientService } from '../services/patient.service'

export class PatientController {
    constructor(private patientService: PatientService) {}

    registerPatient = async (req: Request<unknown, unknown, PatientRegisterRequest>, res: Response, next: NextFunction) => {
        try {
            const result = await this.patientService.registerPatient(req.body)

            return res.status(201).json(result)
        } catch (error) {
            next(error)
        }
    }
}
