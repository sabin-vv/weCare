import { Router } from 'express'
import { container } from 'tsyringe'

import { requireAuth } from '../../../core/middleware/requireAuth'
import { validate } from '../../../core/middleware/validateMiddleware'
import { MedicationLogController } from '../controller/medicationLog.controller'
import { createMedicationLogSchema } from '../validator/medicationLog.schema'

export const createMedicationLogRoutes = () => {
    const router = Router()
    const controller = container.resolve(MedicationLogController)

    router.use(requireAuth)

    router.post('/', validate(createMedicationLogSchema), controller.createLog)
    router.get('/patient/:patientId', controller.getPatientLogs)

    return router
}