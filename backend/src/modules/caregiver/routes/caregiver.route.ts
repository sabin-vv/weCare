import { Router } from 'express'
import { container } from 'tsyringe'

import { upload } from '../../../core/middleware/upload'
import { validate } from '../../../core/middleware/validateMiddleware'
import { CaregiverController } from '../controller/caregiver.controller'
import { registerCaregiverSchema } from '../validator/caregiver.schema'

export const createCaregiverRoutes = () => {
    const router = Router()
    const caregiverController = container.resolve(CaregiverController)

    router.post('/register', upload.none(), validate(registerCaregiverSchema), caregiverController.registerCaregiver)

    return router
}
