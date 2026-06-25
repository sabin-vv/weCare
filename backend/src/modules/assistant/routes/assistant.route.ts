import { Router } from 'express'
import { container } from 'tsyringe'

import { requireAuth } from '../../../core/middleware/requireAuth'
import { AssistantController } from '../controller/assistant.controller'

export const createAssistantRoutes = () => {
    const router = Router()
    const assistantController = container.resolve(AssistantController)

    router.use(requireAuth)

    router.post('/chat', assistantController.chat)

    return router
}
