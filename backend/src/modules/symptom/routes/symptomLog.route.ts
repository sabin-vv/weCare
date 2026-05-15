import { Router } from 'express'
import { container } from 'tsyringe'

import { requireAuth } from '../../../core/middleware/requireAuth'
import { validate } from '../../../core/middleware/validateMiddleware'
import { SymptomLogController } from '../controller/symptomLog.controller'
import { createSymptomLogSchema } from '../validator/symptomLog.schema'

export const createSymptomLogRoutes = () => {
    const router = Router()
    const controller = container.resolve(SymptomLogController)

    router.use(requireAuth)

    router.post('/', validate(createSymptomLogSchema), controller.createLog)
    router.get('/patient/:patientId', controller.getPatientLogs)

    return router
}