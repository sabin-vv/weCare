import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { ISymptomLogService } from '../interfaces/symptomLog.service.interface'
import { CreateSymptomLogDTO } from '../validator/symptomLog.schema'

@injectable()
export class SymptomLogController {
    constructor(@inject(TOKENS.ISymptomLogService) private readonly _logService: ISymptomLogService) {}

    createLog = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const dto: CreateSymptomLogDTO = req.body
        const log = await this._logService.create(userId, dto)

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            data: log,
            message: 'Symptom log created successfully',
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
