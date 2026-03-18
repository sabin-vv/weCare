import { Router } from 'express'

import { validate } from '../../../middlewares/validate.middleware'
import { AuthController } from '../controllers/authController'
import { sendOtpSchema, verifyOtpSchema } from '../schemas/auth.schema'

export const createAuthRoute = (authController: AuthController): Router => {
    const router = Router()
    router.post('/send-otp', validate(sendOtpSchema), authController.sendOtp)
    router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOtp)
    router.post('/reset-password', authController.resetPassword)

    return router
}
