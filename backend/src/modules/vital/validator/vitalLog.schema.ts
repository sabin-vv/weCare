import { z } from 'zod'

export const createVitalLogSchema = z
    .object({
        patientId: z.string().min(1, 'Patient ID is required'),
        vitalType: z.string().min(1, 'Vital type is required'),
        value: z.number().min(0, 'Value must be positive'),
        systolic: z.number().optional(),
        diastolic: z.number().optional(),
        recordedAt: z.string().datetime(),
        notes: z.string().optional(),
    })
    .strict()

export type CreateVitalLogDTO = z.infer<typeof createVitalLogSchema>