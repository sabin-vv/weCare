import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { MSG } from '../constants/messages'
import { IReminderService } from '../interfaces/reminder.service.interface'

@injectable()
export class ReminderController {
    constructor(@inject(TOKENS.IReminderService) private _reminderService: IReminderService) {}

    getReminders = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)

        const result = await this._reminderService.getReminders(userId)
        res.status(HTTP_STATUS.OK).json({ success: true, data: result })
    }

    createReminder = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)

        const result = await this._reminderService.createReminder(userId, req.body)
        res.status(HTTP_STATUS.CREATED).json({ success: true, data: result, message: MSG.CREATED })
    }

    updateReminder = async (req: Request, res: Response) => {
        const reminderId = req.params.reminderId as string
        if (!reminderId) throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.ID_REQUIRED)

        const result = await this._reminderService.updateReminder(reminderId, req.body)
        res.status(HTTP_STATUS.OK).json({ success: true, data: result, message: MSG.UPDATED })
    }

    markReminderDone = async (req: Request, res: Response) => {
        const reminderId = req.params.reminderId as string
        if (!reminderId) throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.ID_REQUIRED)

        const result = await this._reminderService.markReminderDone(reminderId)
        res.status(HTTP_STATUS.OK).json({ success: true, data: result, message: MSG.MARKED_DONE })
    }

    deleteReminder = async (req: Request, res: Response) => {
        const reminderId = req.params.reminderId as string
        if (!reminderId) throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.ID_REQUIRED)

        await this._reminderService.deleteReminder(reminderId)
        res.status(HTTP_STATUS.OK).json({ success: true, message: MSG.DELETED })
    }
}
