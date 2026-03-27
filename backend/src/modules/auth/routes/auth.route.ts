import { Router } from 'express'
import { container } from 'tsyringe'

import { validate } from '../../../core/middleware/validateMiddleware'
import { AuthController } from '../controller/auth.controller'
import { registerDoctorSchema } from '../validator/doctor.schema'
import { SendOtpSchema, verifyOtpSchema } from '../validator/sendOtp.schema'

export const createAuthRoutes = () => {
    const router = Router()

    const authController = container.resolve(AuthController)

    router.post('/send-otp', validate(SendOtpSchema), authController.sendOtp)
    router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOtp)
    router.post('/register-dictor', validate(registerDoctorSchema), authController.registerDoctor)

    return router
}
