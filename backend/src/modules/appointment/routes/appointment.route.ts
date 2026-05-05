import { Router } from 'express'
import { container } from 'tsyringe'

import { requireAuth } from '../../../core/middleware/requireAuth'
import { validate } from '../../../core/middleware/validateMiddleware'
import { AppointmentController } from '../controller/appointment.controller'
import { createAppointmentSchema } from '../validator/appointment.schema'

export const createAppointmentRoutes = () => {
    const router = Router()
    const appointmentController = container.resolve(AppointmentController)

    router.use(requireAuth)
    router.get('/patient', appointmentController.getPatientAppointments)
    router.patch('/:appointmentId/cancel', appointmentController.cancellAppointment)
    router.post('/', validate(createAppointmentSchema), appointmentController.createAppointment)

    return router
}
