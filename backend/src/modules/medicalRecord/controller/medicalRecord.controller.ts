import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { MSG } from '../constants/messages'
import { IMedicalRecordService } from '../interfaces/medicalRecord.service.interface'

@injectable()
export class MedicalRecordController {
    constructor(@inject(TOKENS.IMedicalRecordService) private _medicalRecordService: IMedicalRecordService) {}

    getMedicalRecord = async (req: Request, res: Response) => {
        const doctorId = req.user?.userId
        if (!doctorId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const { patientId } = req.params

        const result = await this._medicalRecordService.getMedicalRecord(doctorId, patientId as string)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result,
            message: MSG.FETCHED,
        })
    }

    updateMedicalRecord = async (req: Request, res: Response) => {
        const doctorId = req.user?.userId
        if (!doctorId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const { patientId } = req.params

        const result = await this._medicalRecordService.updateMedicalRecord(doctorId, patientId as string, req.body)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result,
            message: MSG.UPDATED,
        })
    }

    addClinicalNote = async (req: Request, res: Response) => {
        const doctorId = req.user?.userId
        if (!doctorId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const { patientId } = req.params
        const { note } = req.body

        const result = await this._medicalRecordService.addClinicalNote(doctorId, patientId as string, note)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result,
            message: MSG.NOTE_ADDED,
        })
    }
}
