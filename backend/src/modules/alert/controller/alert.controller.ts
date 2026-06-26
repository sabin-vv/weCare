import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { MSG } from '../constants/messages'
import { IAlertService } from '../interfaces/alert.service.interface'

@injectable()
export class AlertController {
    constructor(@inject(TOKENS.IAlertService) private _alertService: IAlertService) {}

    getAlerts = async (req: Request, res: Response) => {
        const { userId, role } = req.user ?? {}
        if (!userId || !role) throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)

        const { type, severity, status, limit, page } = req.query as Record<string, string | undefined>
        const parsedLimit = limit ? parseInt(limit, 10) : undefined
        const parsedPage = page ? parseInt(page, 10) : undefined
        const result = await this._alertService.getAlerts(userId, role, {
            type,
            severity,
            status,
            limit: Number.isFinite(parsedLimit) ? parsedLimit : undefined,
            page: Number.isFinite(parsedPage) ? parsedPage : undefined,
        })
        res.status(HTTP_STATUS.OK).json({ success: true, data: result })
    }

    getMyAlertCount = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)

        const count = await this._alertService.getPatientAlertCount(userId)
        res.status(HTTP_STATUS.OK).json({ success: true, data: { count } })
    }

    acknowledgeAlert = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)

        const alertId = req.params.alertId as string
        if (!alertId) throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.ID_REQUIRED)

        const { note } = req.body
        const alert = await this._alertService.acknowledgeAlert(userId, alertId, note)
        res.status(HTTP_STATUS.OK).json({ success: true, data: alert, message: MSG.ACKNOWLEDGED })
    }
}
