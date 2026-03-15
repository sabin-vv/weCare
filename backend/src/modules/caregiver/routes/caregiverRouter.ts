import { Router } from 'express'

import { upload } from '../../../middlewares/upload.middleware'
import { validate } from '../../../middlewares/validate.middleware'
import { CaregiverController } from '../controllers/caregiverController'
import { caregiverRegisterSchema } from '../schemas/caregiver.schema'

export const createCaregiverRouter = (caregiverController: CaregiverController): Router => {
    const router = Router()

    router.post(
        '/register',
        upload.fields([
            { name: 'govId', maxCount: 1 },
            { name: 'profileImage', maxCount: 1 },
            { name: 'certificateImage', maxCount: 1 },
            { name: 'licenseImage', maxCount: 1 },
        ]),
        validate(caregiverRegisterSchema),
        caregiverController.registerCaregiver,
    )

    return router
}
