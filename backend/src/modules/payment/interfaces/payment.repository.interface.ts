import { PaymentDocument } from '../types/payment.types'

export interface IPaymentRepository {
    create(data: Partial<PaymentDocument>): Promise<PaymentDocument>

    findByOrderId(orderId: string): Promise<PaymentDocument | null>

    updateById(id: string, data: Partial<PaymentDocument>): Promise<PaymentDocument | null>

    updateByOrderId(id: string, data: Partial<PaymentDocument>): Promise<PaymentDocument | null>
}
