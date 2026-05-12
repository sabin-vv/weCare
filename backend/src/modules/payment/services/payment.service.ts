import crypto from 'crypto'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { env } from '../../../core/config/env'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IAppointmentRepository } from '../../appointment/interfaces/appointment.repository.interface'
import { IPaymentRepository } from '../interfaces/payment.repository.interface'
import { IPaymentService } from '../interfaces/payment.service.interface'
import { PaymentDocument } from '../types/payment.types'
import { VerifyPaymentDTO } from '../validator/payment.schema'

@injectable()
export class PaymentService implements IPaymentService {
    constructor(
        @inject(TOKENS.IAppointmentRepository) private _appointmentRepo: IAppointmentRepository,
        @inject(TOKENS.IPaymentRepository) private _paymentRepo: IPaymentRepository,
    ) {}
    async verifyPayment(dto: VerifyPaymentDTO): Promise<PaymentDocument> {
        const secret = env.RAZORPAY_KEY_SECRET
        const body = dto.razorpayOrderId + '|' + dto.razorpayPaymentId

        const expectedSignature = crypto.createHmac('sha256', secret).update(body.toString()).digest('hex')

        if (expectedSignature !== dto.razorpaySignature) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Invalid payment signature')
        }

        const payment = await this._paymentRepo.findByOrderId(dto.razorpayOrderId)
        if (!payment) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Payment not found')
        }

        if (payment.status === 'success') {
            return payment
        }

        const updatedPayment = await this._paymentRepo.updateById(payment._id.toString(), {
            status: 'success',
            razorpayPaymentId: dto.razorpayPaymentId,
            razorpaySignature: dto.razorpaySignature,
            paidAt: new Date(),
        })
        if (payment.appointmentId) {
            await this._appointmentRepo.update(payment.appointmentId.toString(), { status: 'confirmed', confirmedAt: new Date() })
        }

        if (!updatedPayment) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Payment update failed')
        }

        return updatedPayment
    }
}
