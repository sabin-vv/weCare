import { Router } from 'express'
import { container } from 'tsyringe'

import { requireAuth } from '../../../core/middleware/requireAuth'
import { ReminderController } from '../controller/reminder.controller'

export const createReminderRoutes = () => {
    const router = Router()
    const reminderController = container.resolve(ReminderController)

    router.use(requireAuth)

    router.get('/', reminderController.getReminders)
    router.post('/', reminderController.createReminder)
    router.patch('/:reminderId', reminderController.updateReminder)
    router.patch('/:reminderId/done', reminderController.markReminderDone)
    router.delete('/:reminderId', reminderController.deleteReminder)

    return router
}
