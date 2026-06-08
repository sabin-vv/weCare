import { z } from 'zod'

export const createFeedbackSchema = z.object({
    targetId: z.string().min(1, 'Target ID is required'),
    targetRole: z.enum(['doctor', 'caregiver']),
    rating: z.coerce.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
    comment: z.string().max(500).optional(),
})
