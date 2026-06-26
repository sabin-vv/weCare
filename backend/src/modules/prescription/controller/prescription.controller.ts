import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { MSG } from '../constants/messages'
import { IPrescriptionService } from '../interfaces/prescription.service.interface'

@injectable()
export class PrescriptionController {
    constructor(@inject(TOKENS.IPrescriptionService) private _prescriptionService: IPrescriptionService) {}

    createPrescription = async (req: Request, res: Response) => {
        const doctorUserId = req.user?.userId
        if (!doctorUserId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const result = await this._prescriptionService.createPrescription(doctorUserId, req.body)

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: MSG.CREATED,
            data: result,
        })
    }

    getPatientPrescriptions = async (req: Request, res: Response) => {
        const { patientId } = req.params
        if (typeof patientId !== 'string' || !patientId) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.PATIENT_ID_REQUIRED)
        }

        const status = typeof req.query.status === 'string' ? req.query.status : undefined
        const page = typeof req.query.page === 'string' ? parseInt(req.query.page, 10) : undefined
        const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : undefined
        const result = await this._prescriptionService.getPatientPrescriptions(patientId, page, limit, status)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: 'data' in result ? result.data : result,
            ...('pagination' in result ? { pagination: result.pagination } : {}),
        })
    }

    updatePrescriptionStatus = async (req: Request, res: Response) => {
        const doctorUserId = req.user?.userId
        if (!doctorUserId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const { prescriptionId } = req.params
        if (typeof prescriptionId !== 'string' || !prescriptionId) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.PRESCRIPTION_ID_REQUIRED)
        }

        const result = await this._prescriptionService.updatePrescriptionStatus(doctorUserId, prescriptionId, req.body)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MSG.STATUS_UPDATED,
            data: result,
        })
    }
}
