import { Router } from 'express'
import { container } from 'tsyringe'

import { requireAuth } from '../../../core/middleware/requireAuth'
import { validate } from '../../../core/middleware/validateMiddleware'
import { MedicalRecordController } from '../controller/medicalRecord.controller'
import { addClinicalNoteSchema, updateMedicalRecordSchema } from '../validator/medicalRecord.schema'

export const createMedicalRecordRoutes = () => {
    const router = Router()
    const medicalRecordController = container.resolve(MedicalRecordController)

    router.get('/:patientId', requireAuth, medicalRecordController.getMedicalRecord)
    router.patch(
        '/:patientId',
        requireAuth,
        validate(updateMedicalRecordSchema),
        medicalRecordController.updateMedicalRecord,
    )
    router.post(
        '/:patientId/notes',
        requireAuth,
        validate(addClinicalNoteSchema),
        medicalRecordController.addClinicalNote,
    )

    return router
}
