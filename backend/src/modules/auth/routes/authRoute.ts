import { Router } from 'express'
import { AuthController } from '../controllers/authController'

export const createAuthRoute = (authController: AuthController): Router => {
    const router = Router()
    router.post('/send-otp', authController.sendOtp.bind(authController))
    router.post('/verify-otp', authController.verifyOtp.bind(authController))

    return router
}
