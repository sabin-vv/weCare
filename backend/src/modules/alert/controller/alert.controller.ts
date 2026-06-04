import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IAlertService } from '../interfaces/alert.service.interface'

@injectable()
export class AlertController {
    constructor(@inject(TOKENS.IAlertService) private _alertService: IAlertService) {}

    getAlerts = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')

        const { type, severity, status } = req.query as Record<string, string | undefined>
        const alerts = await this._alertService.getAlerts(userId, { type, severity, status })
        res.status(HTTP_STATUS.OK).json({ success: true, data: alerts })
    }

    acknowledgeAlert = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')

        const alertId = req.params.alertId as string
        if (!alertId) throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Alert ID is required')

        const { note } = req.body
        const alert = await this._alertService.acknowledgeAlert(userId, alertId, note)
        res.status(HTTP_STATUS.OK).json({ success: true, data: alert, message: 'Alert acknowledged' })
    }
}
