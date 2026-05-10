import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IPatientService } from '../interfaces/patient.service.interface'

@injectable()
export class PatientController {
    constructor(@inject(TOKENS.IPatientService) private _patientService: IPatientService) {}

    registerPatient = async (req: Request, res: Response) => {
        const result = await this._patientService.registerPatient(req.body)

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            data: result,
            message: 'Patient registered successfully',
        })
    }

    getProfile = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const result = await this._patientService.getProfile(userId)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result,
            message: 'Patient profile fetched',
        })
    }

    updateProfile = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const result = await this._patientService.updateProfile(userId, req.body)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result,
            message: 'Patient profile updated successfully',
        })
    }

    getPatients = async (req: Request, res: Response) => {
        const doctorId = req.user?.userId

        if (!doctorId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authorized')
        }
        const { search, filter, page, limit } = req.query

        const result = await this._patientService.listPatients(doctorId, {
            search: (search as string)?.trim() || '',
            filter: (filter as string) || 'all',
            page: parseInt(page as string) || 1,
            limit: parseInt(limit as string) || 8,
        })

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result,
            message: 'Patient list fetched succesfully',
        })
    }

    getPatientById = async (req: Request, res: Response) => {
        const doctorId = req.user?.userId

        if (!doctorId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authorized')
        }

        const { patientId } = req.params

        const result = await this._patientService.getPatientById(doctorId, patientId as string)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result,
            message: 'Patient details fetched successfully',
        })
    }
}
