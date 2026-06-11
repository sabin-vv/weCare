import { z } from 'zod'

export const notificationQuerySchema = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    unreadOnly: z.string().optional(),
})

export const createNotificationSchema = z
    .object({
        recipientId: z.string(),
        recipientRole: z.enum(['doctor', 'patient', 'caregiver', 'admin']),
        type: z.string(),
        icon: z.string(),
        message: z.string(),
        metadata: z.any().optional(),
    })
    .strict()
