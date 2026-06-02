import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IReminderService } from '../interfaces/reminder.service.interface'

@injectable()
export class ReminderController {
    constructor(@inject(TOKENS.IReminderService) private _reminderService: IReminderService) {}

    getReminders = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')

        const result = await this._reminderService.getReminders(userId)
        res.status(HTTP_STATUS.OK).json({ success: true, data: result })
    }

    createReminder = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')

        const result = await this._reminderService.createReminder(userId, req.body)
        res.status(HTTP_STATUS.CREATED).json({ success: true, data: result, message: 'Reminder created' })
    }

    updateReminder = async (req: Request, res: Response) => {
        const reminderId = req.params.reminderId as string
        if (!reminderId) throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Reminder ID is required')

        const result = await this._reminderService.updateReminder(reminderId, req.body)
        res.status(HTTP_STATUS.OK).json({ success: true, data: result, message: 'Reminder updated' })
    }

    markReminderDone = async (req: Request, res: Response) => {
        const reminderId = req.params.reminderId as string
        if (!reminderId) throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Reminder ID is required')

        const result = await this._reminderService.markReminderDone(reminderId)
        res.status(HTTP_STATUS.OK).json({ success: true, data: result, message: 'Reminder marked as done' })
    }

    deleteReminder = async (req: Request, res: Response) => {
        const reminderId = req.params.reminderId as string
        if (!reminderId) throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Reminder ID is required')

        await this._reminderService.deleteReminder(reminderId)
        res.status(HTTP_STATUS.OK).json({ success: true, message: 'Reminder deleted' })
    }
}
