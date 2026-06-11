import { Router } from 'express'
import { container } from 'tsyringe'

import { requireAuth } from '../../../core/middleware/requireAuth'
import { NotificationController } from '../controller/notification.controller'

export const createNotificationRoutes = () => {
    const router = Router()
    const notificationController = container.resolve(NotificationController)

    router.use(requireAuth)

    router.get('/', notificationController.getNotifications)
    router.get('/unread-count', notificationController.getUnreadCount)
    router.patch('/:id/read', notificationController.markAsRead)
    router.patch('/read-all', notificationController.markAllAsRead)
    router.delete('/:id', notificationController.deleteNotification)

    return router
}
