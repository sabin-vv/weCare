import { Router } from 'express'
import { container } from 'tsyringe'

import { requireAuth } from '../../../core/middleware/requireAuth'
import { validate } from '../../../core/middleware/validateMiddleware'
import { PatientController } from '../controller/patient.controller'
import { assignCaregiverSchema } from '../validator/assignCaregiver.schema'
import { registerPatientSchema } from '../validator/patient.schema'
import { updateClinicalStatusSchema } from '../validator/updateClinicalStatus.schema'
import { UpdatePatientConditionSchema } from '../validator/updatePatientCondition.schema'
import { UpdatePatientSettingsSchema } from '../validator/updatePatientSettings.schema'

export const createPatientRoutes = () => {
    const router = Router()
    const patientController = container.resolve(PatientController)

    router.get('/', requireAuth, patientController.getPatients)
    router.post('/register', validate(registerPatientSchema), patientController.registerPatient)

    router.get('/me', requireAuth, patientController.getProfile)
    router.get('/me/care-team', requireAuth, patientController.getCareTeam)
    router.put('/me', requireAuth, validate(UpdatePatientSettingsSchema), patientController.updateProfile)

    router.get('/:patientId', requireAuth, patientController.getPatientById)

    router.patch(
        '/:patientId/condition',
        requireAuth,
        validate(UpdatePatientConditionSchema),
        patientController.updatePatientCondition,
    )
    router.patch(
        '/:patientId/caregiver',
        requireAuth,
        validate(assignCaregiverSchema),
        patientController.assignCaregiver,
    )
    router.patch(
        '/:patientId/clinical-status',
        requireAuth,
        validate(updateClinicalStatusSchema),
        patientController.updateClinicalStatus,
    )

    return router
}
