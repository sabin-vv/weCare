import { Document, Types } from 'mongoose'

export interface PaymentDocument extends Document {
    patientId: Types.ObjectId
    caregiverId?: Types.ObjectId

    appointmentId?: Types.ObjectId
    subscriptionId?: Types.ObjectId

    paymentType: 'consultation' | 'subscription'
    paymentMethod: 'razorpay' | 'wallet'

    consultationFee?: number
    platformFee?: number
    totalAmount: number

    razorpayOrderId?: string
    razorpayPaymentId?: string
    razorpaySignature?: string

    status: 'pending' | 'success' | 'failed' | 'refund_pending' | 'refunded'

    paidAt?: Date

    createdAt: Date
    updatedAt: Date
}

export interface CreatePaymentDTO {
    patientId: string

    appointmentId?: string
    subscriptionId?: string

    paymentType: 'consultation' | 'subscription'

    amount: number
    platformFee: number
}
