import { z } from 'zod'

export const createSymptomLogSchema = z
    .object({
        patientId: z.string().min(1, 'Patient ID is required'),
        symptom: z.string().min(1, 'Symptom is required'),
        onsetTime: z.string().datetime(),
        severity: z.enum(['mild', 'moderate', 'severe', 'critical']),
        observations: z.string().optional(),
    })
    .strict()

export type CreateSymptomLogDTO = z.infer<typeof createSymptomLogSchema>