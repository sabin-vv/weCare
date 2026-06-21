import { Router } from 'express'
import { container } from 'tsyringe'

import { requireAuth } from '../../../core/middleware/requireAuth'
import { validate } from '../../../core/middleware/validateMiddleware'
import { AppointmentController } from '../controller/appointment.controller'
import { createAppointmentSchema, rescheduleAppointmentSchema, retryPaymentSchema } from '../validator/appointment.schema'

export const createAppointmentRoutes = () => {
    const router = Router()
    const appointmentController = container.resolve(AppointmentController)

    router.use(requireAuth)
    router.get('/patient', appointmentController.getPatientAppointments)
    router.get('/doctor', appointmentController.getDoctorAppointments)
    router.get('/:appointmentId', appointmentController.getAppointmentById)
    router.patch('/:appointmentId/cancel', appointmentController.cancellAppointment)
    router.patch('/:appointmentId/reschedule', validate(rescheduleAppointmentSchema), appointmentController.rescheduleAppointment)
    router.post('/:appointmentId/retry-payment', validate(retryPaymentSchema), appointmentController.retryPayment)
    router.post('/', validate(createAppointmentSchema), appointmentController.createAppointment)

    return router
}
