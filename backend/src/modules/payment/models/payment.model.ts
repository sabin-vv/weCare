import { model, Schema, Types } from 'mongoose'

import { PaymentDocument } from '../types/payment.types'

const paymentSchema = new Schema<PaymentDocument>(
    {
        patientId: {
            type: Types.ObjectId,
            ref: 'Patient',
            required: true,
        },
        caregiverId: {
            type: Types.ObjectId,
            ref: 'Caregiver',
        },
        appointmentId: {
            type: Types.ObjectId,
            ref: 'Appointment',
        },
        // subscriptionId: {
        //     types: Types.ObjectId,
        //     ref: 'Subscription',
        // },
        paymentType: {
            type: String,
            enum: ['consultation', 'subscription'],
            required: true,
        },
        consultationFee: {
            type: Number,
        },
        platformFee: {
            type: Number,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        razorpayOrderId: {
            type: String,
        },
        razorpayPaymentId: {
            type: String,
        },
        razorpaySignature: {
            type: String,
        },
        status: {
            type: String,
            enum: ['pending', 'success', 'failed', 'refund_pending', 'refunded'],
            default: 'pending',
            required: true,
        },
        paidAt: {
            type: Date,
        },
    },
    { timestamps: true },
)

export const PaymentModel = model<PaymentDocument>('Payment', paymentSchema)
