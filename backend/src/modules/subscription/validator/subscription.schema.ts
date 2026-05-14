import z from 'zod'

export const createSubscriptionSchema = z.object({
    billingCycle: z.enum(['monthly', 'yearly']),
    paymentMethod: z.enum(['razorpay', 'wallet']),
    caregiverId: z.string().optional(),
})

export type CreateSubscriptionDTO = z.infer<typeof createSubscriptionSchema>