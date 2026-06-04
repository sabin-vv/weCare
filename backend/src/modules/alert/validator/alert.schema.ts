import { z } from 'zod'

export const acknowledgeAlertSchema = z
    .object({
        note: z.string().optional(),
    })
    .strict()
