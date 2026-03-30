import { Router } from 'express'
import { container } from 'tsyringe'

import { requireAdmin } from '../../../core/middleware/requireAdmin'
import { AdminController } from '../controller/admin.controller'

export const createAdminRoutes = () => {
    const router = Router()
    const adminController = container.resolve(AdminController)

    router.get('/pending-doctors', requireAdmin, adminController.getPendingDoctors)
    router.patch('/verify-doctor/:doctorId', requireAdmin, adminController.verifyDoctor)
    router.patch(
        '/verify-specialization/:doctorId/:specIndex',
        requireAdmin,
        adminController.verifySpecialization,
    )

    router.get('/pending-caregivers', requireAdmin, adminController.getPendingCaregivers)
    router.patch('/verify-caregiver/:caregiverId', requireAdmin, adminController.verifyCaregiver)

    router.get('/pending-count', requireAdmin, adminController.getPendingCount)

    router.get('/users', requireAdmin, adminController.getUsers)
    router.patch('/toggle-status/:userId', requireAdmin, adminController.toggleUserStatus)

    return router
}

