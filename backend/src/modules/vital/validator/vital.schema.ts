import { z } from 'zod'

export const vitalPlanItemSchema = z.object({
    type: z.enum(['blood_pressure', 'blood_sugar', 'heart_rate', 'spo2']),
    frequencyValue: z.number().int().min(1, 'Frequency value is required'),
    frequencyUnit: z.enum(['hours', 'days', 'weeks']),
    durationValue: z.number().int().min(1, 'Duration value is required'),
    durationUnit: z.enum(['hours', 'days', 'weeks', 'months']),
})

export const createVitalPlanSchema = z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
    vitals: z.array(vitalPlanItemSchema).min(1, 'At least one vital must be selected'),
    instructions: z.string().trim().optional(),
    status: z.enum(['active', 'completed', 'cancelled']).optional(),
})

export type CreateVitalPlanDTO = z.infer<typeof createVitalPlanSchema>
