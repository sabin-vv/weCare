import { Router } from 'express'

import { upload } from '../../../middlewares/upload.middleware'
import { DoctorController } from '../controllers/doctorController'

export const createDoctorRouter = (doctorController: DoctorController): Router => {
    const router = Router()
    router.post(
        '/register',
        upload.any(),

        doctorController.registerDoctor,
    )
    return router
}
