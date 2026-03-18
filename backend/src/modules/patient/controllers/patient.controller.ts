import { NextFunction, Request, Response } from 'express'

import { PatientRegisterRequest } from '../interfaces/patientInterfaces'
import { PatientServices } from '../services/patientServices'

export class PatientController {
    constructor(private patientServices: PatientServices) {}

    registerPatient = async (req: Request<unknown, unknown, PatientRegisterRequest>, res: Response, next: NextFunction) => {
        try {
            const result = await this.patientServices.registerPatient(req.body)

            return res.status(201).json(result)
        } catch (error) {
            next(error)
        }
    }
}
