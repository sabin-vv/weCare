import { Router } from 'express'

import { validate } from '../../../middlewares/validate.middleware'
import { PatientController } from '../controllers/patient.controller'
import { patientRegisterSchema } from '../schemas/patinentRegisterSchema'

export const createPatientRoutes = (patientController: PatientController): Router => {
    const router = Router()

    router.post('/register', validate(patientRegisterSchema), patientController.registerPatient)

    return router
}
