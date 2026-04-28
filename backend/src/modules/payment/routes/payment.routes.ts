import { Router } from 'express'
import { container } from 'tsyringe'

import { validate } from '../../../core/middleware/validateMiddleware'
import { PaymentController } from '../controller/payment.controller'
import { verifyPaymentSchema } from '../validator/payment.schema'

export const createPaymentRoutes = () => {
    const router = Router()
    const paymentController = container.resolve(PaymentController)

    router.post('/verify', validate(verifyPaymentSchema), paymentController.verifyPayment)

    return router
}
