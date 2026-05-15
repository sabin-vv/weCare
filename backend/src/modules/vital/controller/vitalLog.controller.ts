import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IVitalLogService } from '../interfaces/vitalLog.service.interface'
import { CreateVitalLogDTO } from '../validator/vitalLog.schema'

@injectable()
export class VitalLogController {
    constructor(@inject(TOKENS.IVitalLogService) private readonly _logService: IVitalLogService) {}

    createLog = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const dto: CreateVitalLogDTO = req.body
        const log = await this._logService.create(userId, dto)

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            data: log,
            message: 'Vital log created successfully',
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
