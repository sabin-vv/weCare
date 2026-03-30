import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { IPatientService } from '../interfaces/patient.service.interface'

@injectable()
export class PatientController {
    constructor(@inject(TOKENS.IPatientService) private patientService: IPatientService) {}

    registerPatient = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.patientService.registerPatient(req.body)

            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                data: result,
                message: 'Patient registered successfully',
            })
        } catch (error) {
            next(error)
        }
    }
}

