import { Router } from 'express'
import { container } from 'tsyringe'

import { upload } from '../../../core/middleware/upload'
import { validate } from '../../../core/middleware/validateMiddleware'
import { AuthController } from '../controller/auth.controller'
import { loginSchema } from '../validator/auth.schema'
import { registerDoctorSchema } from '../validator/doctor.schema'
import { SendOtpSchema, verifyOtpSchema } from '../validator/sendOtp.schema'

export const createAuthRoutes = () => {
    const router = Router()

    const authController = container.resolve(AuthController)

    router.post('/send-otp', validate(SendOtpSchema), authController.sendOtp)
    router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOtp)
    router.post('/login', validate(loginSchema), authController.login)
    router.post('/register-doctor', upload.any(), validate(registerDoctorSchema), authController.registerDoctor)
    router.post('/refresh-token', authController.refreshToken)
    return router
}
