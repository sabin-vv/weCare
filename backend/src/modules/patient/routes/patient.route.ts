import { Router } from 'express'
import { container } from 'tsyringe'

import { validate } from '../../../core/middleware/validateMiddleware'
import { PatientController } from '../controller/patient.controller'
import { registerPatientSchema } from '../validator/patient.schema'

export const createPatientRoutes = () => {
    const router = Router()
    const patientController = container.resolve(PatientController)

    router.post('/register', validate(registerPatientSchema), patientController.registerPatient)

    return router
}

