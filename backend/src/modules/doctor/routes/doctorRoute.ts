import { Router } from 'express'
import { DoctorController } from '../controllers/doctorController'
import { upload } from '../../../middlewares/upload.middleware'

export const createDoctorRouter = (doctorController: DoctorController): Router => {
    const router = Router()
    router.post(
        '/register',
        upload.any(),

        doctorController.registerDoctor,
    )
    return router
}
