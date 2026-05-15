import { Router } from 'express'
import { container } from 'tsyringe'

import { requireAuth } from '../../../core/middleware/requireAuth'
import { validate } from '../../../core/middleware/validateMiddleware'
import { VitalLogController } from '../controller/vitalLog.controller'
import { createVitalLogSchema } from '../validator/vitalLog.schema'

export const createVitalLogRoutes = () => {
    const router = Router()
    const controller = container.resolve(VitalLogController)

    router.use(requireAuth)

    router.post('/', validate(createVitalLogSchema), controller.createLog)
    router.get('/patient/:patientId', controller.getPatientLogs)

    return router
}