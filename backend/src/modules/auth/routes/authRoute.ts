import { Router } from 'express'

import { validate } from '../../../middlewares/validate.middleware'
import { AuthController } from '../controllers/authController'
import { OtpController } from '../controllers/otpControllers'
import { loginSchema, resetPasswordSchema, sendOtpSchema, verifyOtpSchema } from '../schemas/auth.schema'

export const createAuthRoute = (authController: AuthController, otpController: OtpController): Router => {
    const router = Router()
    router.post('/send-otp', validate(sendOtpSchema), otpController.sendOtp)
    router.post('/verify-otp', validate(verifyOtpSchema), otpController.verifyOtp)
    router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword)
    router.post('/login', validate(loginSchema), authController.login)
    router.post('/refresh-token', authController.refreshToken)
    router.post('/logout', authController.logout)

    return router
}
