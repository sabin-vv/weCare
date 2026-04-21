import { Router } from 'express'
import { container } from 'tsyringe'

import { requireAuth } from '../../../core/middleware/requireAuth'
import { upload } from '../../../core/middleware/upload'
import { validate } from '../../../core/middleware/validateMiddleware'
import { DoctorController } from '../controller/doctor.controller'
import { DoctorSchema } from '../validator/registerDoctor.schema'
import { UpdateDoctorAvailabilitySchema } from '../validator/updateDoctorAvailability.schema'
import { UpdateDoctorSettingsSchema } from '../validator/updateDoctorSettings.schema'

export const createDoctorRoutes = () => {
    const router = Router()
    const doctorController = container.resolve(DoctorController)

    router.get('/', doctorController.searchDoctors)

    router.use(requireAuth)

    router.get('/me', doctorController.getProfile)
    router.put('/me', upload.none(), validate(UpdateDoctorSettingsSchema), doctorController.updateProfile)
    router.get('/availability', doctorController.getAvailability)
    router.put('/availability', validate(UpdateDoctorAvailabilitySchema), doctorController.updateAvailability)
    router.post('/profile', upload.none(), validate(DoctorSchema), doctorController.createProfile)

    return router
}
