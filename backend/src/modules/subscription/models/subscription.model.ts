import { model, Schema, Types } from 'mongoose'

import { SubscriptionDocument } from '../types/subscription.types'

const subscriptionSchema = new Schema<SubscriptionDocument>(
    {
        patientId: {
            type: Types.ObjectId,
            ref: 'Patient',
            required: true,
        },
        caregiverId: {
            type: Types.ObjectId,
            ref: 'Caregiver',
            required: true,
        },
        subscriptionFee: {
            type: Number,
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending_payment', 'active', 'expired', 'cancelled'],
            default: 'pending_payment',
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending',
            required: true,
        },
        billingCycle: {
            type: String,
            enum: ['monthly', 'yearly'],
            default: 'monthly',
            required: true,
        },
    },
    { timestamps: true },
)

subscriptionSchema.index({ patientId: 1, status: 1 })
subscriptionSchema.index({ caregiverId: 1, status: 1 })
subscriptionSchema.index({ patientId: 1, caregiverId: 1 }, { unique: true })

export const SubscriptionModel = model<SubscriptionDocument>('Subscription', subscriptionSchema)