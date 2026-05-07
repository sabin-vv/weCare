import { BaseRepository } from '../../../core/base/base.repository'
import { IPaymentRepository } from '../interfaces/payment.repository.interface'
import { PaymentModel } from '../models/payment.model'
import { PaymentDocument } from '../types/payment.types'

export class PaymentRepository extends BaseRepository<PaymentDocument> implements IPaymentRepository {
    constructor() {
        super(PaymentModel)
    }
    async create(data: Partial<PaymentDocument>) {
        return await PaymentModel.create(data)
    }

    async findByOrderId(orderId: string) {
        return await PaymentModel.findOne({ razorpayOrderId: orderId })
    }

    async updateById(id: string, data: Partial<PaymentDocument>) {
        return await PaymentModel.findByIdAndUpdate(id, data, { returnDocument: 'after' })
    }

    async updateByOrderId(orderId: string, data: Partial<PaymentDocument>) {
        return await PaymentModel.findOneAndUpdate({ razorpayOrderId: orderId }, data, { returnDocument: 'after' })
    }
}
