import { z } from 'zod'

export const updateClinicalStatusSchema = z.object({
    clinicalStatus: z.enum(['active', 'hospitalized', 'recovered', 'deceased']),
})

export type UpdateClinicalStatusDTO = z.infer<typeof updateClinicalStatusSchema>
