import { Router } from 'express'
import { container } from 'tsyringe'

import { requireAuth } from '../../../core/middleware/requireAuth'
import { validate } from '../../../core/middleware/validateMiddleware'
import { AlertController } from '../controller/alert.controller'
import { acknowledgeAlertSchema } from '../validator/alert.schema'

export const createAlertRoutes = () => {
    const router = Router()
    const alertController = container.resolve(AlertController)

    router.use(requireAuth)

    router.get('/', alertController.getAlerts)
    router.get('/me/count', alertController.getMyAlertCount)
    router.patch('/:alertId/acknowledge', validate(acknowledgeAlertSchema), alertController.acknowledgeAlert)

    return router
}
