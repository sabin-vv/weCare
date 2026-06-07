import { Router } from 'express'
import { container } from 'tsyringe'

import { requireAuth } from '../../../core/middleware/requireAuth'
import { CaregiverActivityController } from '../controller/caregiverActivity.controller'

export const createCaregiverActivityRoutes = () => {
    const router = Router()
    const controller = container.resolve(CaregiverActivityController)

    router.use(requireAuth)

    router.get('/', controller.getActivityLogs)

    return router
}
