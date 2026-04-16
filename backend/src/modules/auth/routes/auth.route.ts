import { Router } from 'express'
import { container } from 'tsyringe'

import { requireAuth } from '../../../core/middleware/requireAuth'
import { validate } from '../../../core/middleware/validateMiddleware'
import { AuthController } from '../controller/auth.controller'
import { changePasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from '../validator/auth.schema'
import { SendOtpSchema, verifyOtpSchema } from '../validator/sendOtp.schema'

export const createAuthRoutes = () => {
    const router = Router()

    const authController = container.resolve(AuthController)

    router.post('/register', validate(registerSchema), authController.register)
    router.post('/send-otp', validate(SendOtpSchema), authController.sendOtp)
    router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOtp)
    router.post('/login', validate(loginSchema), authController.login)
    router.post('/refresh-token', authController.refreshToken)
    router.post('/logout', authController.logout)
    router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword)
    router.post('/change-password', requireAuth, validate(changePasswordSchema), authController.changePassword)
    router.get('/me', requireAuth, authController.getCurrentUser)

    return router
}
