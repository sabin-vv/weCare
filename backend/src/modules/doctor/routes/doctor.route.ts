import { Router } from 'express'
import { container } from 'tsyringe'

import { validate } from '../../../core/middleware/validateMiddleware'
import { DoctorController } from '../controller/doctor.controller'
import { registerDoctorSchema } from '../validator/registerDoctor.schema'

export const createDoctorRoutes = () => {
    const router = Router()
    const doctorController = container.resolve(DoctorController)

    router.post('/register', validate(registerDoctorSchema), doctorController.registerDoctor)

    return router
}
