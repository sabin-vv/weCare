import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { MSG } from '../constants/messages'
import { INotificationService } from '../interfaces/notification.service.interface'

@injectable()
export class NotificationController {
    constructor(@inject(TOKENS.INotificationService) private _notificationService: INotificationService) {}

    getNotifications = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        const role = req.user?.role
        if (!userId || !role) throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)

        const { page, limit, unreadOnly } = req.query as Record<string, string | undefined>
        const result = await this._notificationService.getNotifications(userId, role, {
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            unreadOnly: unreadOnly === 'true',
        })

        res.status(HTTP_STATUS.OK).json({ success: true, ...result })
    }

    markAsRead = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)

        const notificationId = req.params.id as string
        if (!notificationId) throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.ID_REQUIRED)

        const notification = await this._notificationService.markAsRead(userId, notificationId)
        res.status(HTTP_STATUS.OK).json({ success: true, data: notification })
    }

    markAllAsRead = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)

        await this._notificationService.markAllAsRead(userId)
        res.status(HTTP_STATUS.OK).json({ success: true, message: 'All notifications marked as read' })
    }

    getUnreadCount = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)

        const count = await this._notificationService.getUnreadCount(userId)
        res.status(HTTP_STATUS.OK).json({ success: true, data: { count } })
    }

    deleteNotification = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)

        const notificationId = req.params.id as string
        if (!notificationId) throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.ID_REQUIRED)

        await this._notificationService.deleteNotification(userId, notificationId)
        res.status(HTTP_STATUS.OK).json({ success: true, message: 'Notification deleted' })
    }
}
