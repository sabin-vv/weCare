import { Router } from 'express'
import { container } from 'tsyringe'

import { requireAuth } from '../../../core/middleware/requireAuth'
import { validate } from '../../../core/middleware/validateMiddleware'
import { VitalController } from '../controller/vital.controller'
import { createVitalPlanSchema, createVitalSchema } from '../validator/vital.schema'

export const createVitalRoutes = () => {
    const router = Router()
    const vitalController = container.resolve(VitalController)

    router.use(requireAuth)

    router.post('/', validate(createVitalSchema), vitalController.createVital)
    router.get('/patient/:patientId', vitalController.getPatientVitals)
    router.post('/plans', validate(createVitalPlanSchema), vitalController.createVitalPlan)
    router.get('/plans/patient/:patientId', vitalController.getPatientVitalPlans)
    router.patch('/plans/:planId/cancel', vitalController.cancelVitalPlan)

    router.get('/schedules/me', vitalController.getPatientVitalSchedules)

    router.post('/schedules/generate', vitalController.generateVitalSchedules)

    return router
}
