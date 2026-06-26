import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { MSG } from '../constants/messages'
import { IMedicationLogService } from '../interfaces/medicationLog.service.interface'
import { CreateMedicationLogDTO } from '../validator/medicationLog.schema'

@injectable()
export class MedicationLogController {
    constructor(@inject(TOKENS.IMedicationLogService) private readonly _logService: IMedicationLogService) {}

    createLog = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const dto: CreateMedicationLogDTO = req.body
        const log = await this._logService.create(userId, dto)

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            data: log,
            message: 'Medication log created successfully',
        })
    }

    getPatientLogs = async (req: Request, res: Response) => {
        const { patientId } = req.params
        const logs = await this._logService.getPatientLogs(String(patientId))

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: logs,
        })
    }
}
