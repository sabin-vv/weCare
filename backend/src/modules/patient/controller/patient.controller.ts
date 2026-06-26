import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { MSG } from '../constants/messages'
import { IPatientService } from '../interfaces/patient.service.interface'

@injectable()
export class PatientController {
    constructor(@inject(TOKENS.IPatientService) private _patientService: IPatientService) {}

    registerPatient = async (req: Request, res: Response) => {
        const result = await this._patientService.registerPatient(req.body)

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            data: result,
            message: MSG.REGISTERED,
        })
    }

    getProfile = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const result = await this._patientService.getProfile(userId)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result,
            message: MSG.PROFILE_FETCHED,
        })
    }

    updateProfile = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const result = await this._patientService.updateProfile(userId, req.body)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result,
            message: MSG.PROFILE_UPDATED,
        })
    }

    getPatients = async (req: Request, res: Response) => {
        const doctorId = req.user?.userId

        if (!doctorId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHORIZED)
        }
        const { search, clinicalStatus, riskLevel, page, limit } = req.query

        const result = await this._patientService.listPatients(doctorId, {
            search: (search as string)?.trim() || '',
            clinicalStatus: (clinicalStatus as string) || 'all',
            riskLevel: (riskLevel as string) || 'all',
            page: parseInt(page as string) || 1,
            limit: parseInt(limit as string) || 8,
        })

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result,
            message: MSG.LIST_FETCHED,
        })
    }

    getPatientById = async (req: Request, res: Response) => {
        const doctorId = req.user?.userId

        if (!doctorId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHORIZED)
        }

        const { patientId } = req.params

        const result = await this._patientService.getPatientById(doctorId, patientId as string)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result,
            message: MSG.DETAILS_FETCHED,
        })
    }

    updatePatientCondition = async (req: Request, res: Response) => {
        const doctorId = req.user?.userId

        if (!doctorId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHORIZED)
        }

        const { patientId } = req.params

        const result = await this._patientService.updatePatientCondition(doctorId, patientId as string, req.body)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result,
            message: MSG.CONDITION_UPDATED,
        })
    }

    assignCaregiver = async (req: Request, res: Response) => {
        const doctorId = req.user?.userId

        if (!doctorId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHORIZED)
        }

        const { patientId } = req.params
        const { caregiverId } = req.body

        const result = await this._patientService.assignCaregiver(doctorId, patientId as string, caregiverId)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result,
            message: MSG.CAREGIVER_ASSIGNED,
        })
    }

    getCareTeam = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const result = await this._patientService.getCareTeam(userId)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result,
            message: MSG.CARE_TEAM_FETCHED,
        })
    }

    updateClinicalStatus = async (req: Request, res: Response) => {
        const doctorId = req.user?.userId

        if (!doctorId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHORIZED)
        }

        const { patientId } = req.params
        const { clinicalStatus } = req.body

        const result = await this._patientService.updateClinicalStatus(doctorId, patientId as string, clinicalStatus)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result,
            message: MSG.CLINICAL_STATUS_UPDATED,
        })
    }
}
