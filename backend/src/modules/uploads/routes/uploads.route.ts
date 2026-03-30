import { Router } from 'express'
import { container } from 'tsyringe'

import { validate } from '../../../core/middleware/validateMiddleware'
import { UploadsController } from '../controller/uploads.controller'
import { uploadsPresignSchema } from '../validator/presignUpload.schema'

export const createUploadsRoutes = () => {
    const router = Router()
    const uploadsController = container.resolve(UploadsController)

    router.post('/presign', validate(uploadsPresignSchema), uploadsController.presignUpload)

    return router
}

