import { z } from 'zod'

export const medicationItemSchema = z.object({
    name: z.string().min(1, 'Medication name is required'),
    dosage: z.string().min(1, 'Dosage is required'),
    route: z.enum(['oral', 'injection', 'IV', 'inhalation']),
    frequency: z.string().min(1, 'Frequency is required'),
    scheduleTimes: z.array(z.string().min(1, 'Schedule time is required')).default([]),
    priority: z.enum(['Critical', 'High', 'Medium', 'Low']).default('Medium'),
    duration: z.number().min(1, 'Duration is required'),
    durationUnit: z.enum(['Days', 'Weeks', 'Months']).default('Days'),
    endDate: z.string().datetime().optional(),
    instructions: z.string().optional(),
})

export const createPrescriptionSchema = z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
    medications: z.array(medicationItemSchema).min(1, 'At least one medication is required'),
    note: z.string().optional(),
    status: z.enum(['active', 'on_hold', 'discontinued', 'amended', 'completed']).optional(),
})

export const updatePrescriptionStatusSchema = z.object({
    status: z.enum(['active', 'on_hold', 'discontinued', 'amended', 'completed']),
})

export type CreatePrescriptionDTO = z.infer<typeof createPrescriptionSchema>
export type UpdatePrescriptionStatusDTO = z.infer<typeof updatePrescriptionStatusSchema>
