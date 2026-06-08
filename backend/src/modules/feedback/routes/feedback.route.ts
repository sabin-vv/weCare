import { Router } from 'express'
import { container } from 'tsyringe'

import { requireAuth } from '../../../core/middleware/requireAuth'
import { validate } from '../../../core/middleware/validateMiddleware'
import { FeedbackController } from '../controller/feedback.controller'
import { createFeedbackSchema } from '../validator/feedback.schema'

export const createFeedbackRoutes = () => {
    const router = Router()
    const controller = container.resolve(FeedbackController)

    router.use(requireAuth)

    router.post('/', validate(createFeedbackSchema), controller.submitFeedback)

    return router
}
