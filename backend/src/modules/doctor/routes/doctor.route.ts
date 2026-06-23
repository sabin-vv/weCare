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

    router.get('/me', requireAuth, doctorController.getProfile)
    router.put('/me', requireAuth, upload.none(), validate(UpdateDoctorSettingsSchema), doctorController.updateProfile)
    router.get('/availability', requireAuth, doctorController.getAvailability)
    router.put(
        '/availability',
        requireAuth,
        validate(UpdateDoctorAvailabilitySchema),
        doctorController.updateAvailability,
    )
    router.post('/profile', requireAuth, upload.none(), validate(DoctorSchema), doctorController.createProfile)

    router.get('/dashboard', requireAuth, doctorController.getDashboard)
    router.get('/appointment-stats', requireAuth, doctorController.getAppointmentStats)

    router.put('/patients/:patientId/start-consultation', requireAuth, doctorController.startConsultation)
    router.put('/patients/:patientId/complete-consultation', requireAuth, doctorController.completeConsultation)

    router.get('/:doctorId', doctorController.getDoctorById)
    router.get('/:doctorId/slots', doctorController.getDoctorSlots)
    return router
}
