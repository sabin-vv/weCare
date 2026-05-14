import { z } from 'zod'

export const platformSettingsSchema = z.object({
    platformName: z.string().min(3, 'Platform name must be at least 3 characters'),
    contactEmail: z.string().email('Invalid email address'),
    address: z.string().min(5, 'Address is too short'),
    platformFee: z.number().min(0, 'Fee cannot be negative'),
    subscriptionFee: z.number().min(0, 'Subscription fee cannot be negative'),
    billingCycle: z.enum(['monthly', 'yearly']),
})

export type PlatformSettingsForm = z.infer<typeof platformSettingsSchema>
