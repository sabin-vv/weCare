import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { MSG } from '../constants/messages'
import { ICaregiverActivityService } from '../interfaces/caregiverActivity.service.interface'

@injectable()
export class CaregiverActivityController {
    constructor(
        @inject(TOKENS.ICaregiverActivityService)
        private _activityService: ICaregiverActivityService,
    ) {}

    getActivityLogs = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)

        const page = parseInt(req.query.page as string, 10) || 1
        const limit = parseInt(req.query.limit as string, 10) || 8

        const result = await this._activityService.getActivityLogs(userId, page, limit)
        res.status(HTTP_STATUS.OK).json({ success: true, data: result })
    }
}
