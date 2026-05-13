import { z } from 'zod'

export const assignCaregiverSchema = z.object({
    caregiverId: z.string().min(1, 'Caregiver ID is required'),
})

export type AssignCaregiverDTO = z.infer<typeof assignCaregiverSchema>