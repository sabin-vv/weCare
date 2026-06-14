import { Router } from 'express'
import { container } from 'tsyringe'

import { requireAdmin } from '../../../core/middleware/requireAdmin'
import { ActivityLogController } from '../controller/activityLog.controller'

export const createActivityLogRoutes = () => {
    const router = Router()
    const controller = container.resolve(ActivityLogController)

    router.use(requireAdmin)

    router.get('/', controller.getActivityLogs)

    return router
}
