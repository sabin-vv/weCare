import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { IActivityLogService } from '../interfaces/activityLog.service.interface'
import { ActivityCategory, ActivityAction, ActorRole, TargetType } from '../types/activityLog.types'

@injectable()
export class ActivityLogController {
    constructor(
        @inject(TOKENS.IActivityLogService)
        private _activityLogService: IActivityLogService,
    ) {}

    getActivityLogs = async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string, 10) || 1
        const limit = parseInt(req.query.limit as string, 10) || 20
        const category = req.query.category as ActivityCategory | undefined
        const performedByRole = req.query.performedByRole as ActorRole | undefined
        const action = req.query.action as ActivityAction | undefined
        const targetType = req.query.targetType as TargetType | undefined
        const search = req.query.search as string | undefined
        const startDate = req.query.startDate as string | undefined
        const endDate = req.query.endDate as string | undefined

        const result = await this._activityLogService.getActivityLogs({
            page,
            limit,
            category,
            performedByRole,
            action,
            targetType,
            search,
            startDate,
            endDate,
        })
        res.status(HTTP_STATUS.OK).json({ success: true, ...result })
    }
}
