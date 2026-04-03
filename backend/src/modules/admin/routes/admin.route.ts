import { Router } from 'express'
import { container } from 'tsyringe'

import { requireAdmin } from '../../../core/middleware/requireAdmin'
import { validate } from '../../../core/middleware/validateMiddleware'
import { AuthController } from '../../auth/controller/auth.controller'
import { loginSchema } from '../../auth/validator/auth.schema'
import { AdminController } from '../controller/admin.controller'

export const createAdminRoutes = () => {
    const router = Router()
    const adminController = container.resolve(AdminController)
    const authController = container.resolve(AuthController)

    router.post('/login', validate(loginSchema), authController.login)

    router.get('/pending-doctors', requireAdmin, adminController.getPendingDoctors)
    router.get('/recent-doctor-verifications', requireAdmin, adminController.getRecentDoctorVerifications)
    router.patch('/verify-doctor/:doctorId', requireAdmin, adminController.verifyDoctor)
    router.patch('/verify-specialization/:doctorId/:specIndex', requireAdmin, adminController.verifySpecialization)

    router.get('/pending-caregivers', requireAdmin, adminController.getPendingCaregivers)
    router.patch('/verify-caregiver/:caregiverId', requireAdmin, adminController.verifyCaregiver)

    router.get('/pending-count', requireAdmin, adminController.getPendingCount)

    router.get('/users', requireAdmin, adminController.getUsers)
    router.patch('/toggle-status/:userId', requireAdmin, adminController.toggleUserStatus)

    return router
}
