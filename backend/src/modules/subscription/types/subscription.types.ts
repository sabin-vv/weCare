import type { Document, Types } from 'mongoose'

export type SubscriptionStatus = 'pending_payment' | 'active' | 'expired' | 'cancelled'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export type BillingCycle = 'monthly' | 'yearly'

export interface SubscriptionDocument extends Document {
    patientId: Types.ObjectId
    caregiverId: Types.ObjectId
    subscriptionFee: number
    startDate: Date
    endDate: Date
    status: SubscriptionStatus
    paymentStatus: PaymentStatus
    billingCycle: BillingCycle
    createdAt?: Date
    updatedAt?: Date
}

export interface SubscriptionDTO {
    subscriptionId: string
    status: SubscriptionStatus
    paymentStatus: PaymentStatus
    billingCycle: BillingCycle
    subscriptionFee: number
    startDate: string
    endDate: string
    caregiver: {
        id: string
        name: string
    } | null
}
