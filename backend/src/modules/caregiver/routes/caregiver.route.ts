import { Router } from 'express'
import { container } from 'tsyringe'

import { requireAuth } from '../../../core/middleware/requireAuth'
import { upload } from '../../../core/middleware/upload'
import { validate } from '../../../core/middleware/validateMiddleware'
import { CaregiverController } from '../controller/caregiver.controller'
import { createCaregiverProfileSchema } from '../validator/caregiver.schema'
import { logMedicationSchema, logSymptomSchema, logVitalReadingSchema } from '../validator/caregiverLogging.schema'
import { UpdateCaregiverSettingsSchema } from '../validator/updateCaregiverSettings.schema'

export const createCaregiverRoutes = () => {
    const router = Router()
    const caregiverController = container.resolve(CaregiverController)

    router.post(
        '/profile',
        requireAuth,
        upload.none(),
        validate(createCaregiverProfileSchema),
        caregiverController.createProfile,
    )
    router.get('/me', requireAuth, caregiverController.getProfile)
    router.put(
        '/me',
        requireAuth,
        upload.none(),
        validate(UpdateCaregiverSettingsSchema),
        caregiverController.updateProfile,
    )
    router.get('/patients/:patientId/medications', requireAuth, caregiverController.getPatientMedications)
    router.get('/patients/:patientId/vital-plans', requireAuth, caregiverController.getPatientVitalPlans)
    router.get('/patients/:patientId/vital-schedules', requireAuth, caregiverController.getPatientVitalSchedules)
    router.post(
        '/patients/:patientId/medications/:scheduleId/log',
        requireAuth,
        validate(logMedicationSchema),
        caregiverController.logMedication,
    )
    router.post(
        '/patients/:patientId/vitals/log',
        requireAuth,
        validate(logVitalReadingSchema),
        caregiverController.logVitalReading,
    )
    router.post(
        '/patients/:patientId/symptoms/log',
        requireAuth,
        validate(logSymptomSchema),
        caregiverController.logSymptom,
    )
    router.get('/patients', requireAuth, caregiverController.getMyPatients)
    router.get('/', requireAuth, caregiverController.listCaregivers)

    return router
}
