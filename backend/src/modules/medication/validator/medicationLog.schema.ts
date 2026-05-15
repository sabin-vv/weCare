import { z } from 'zod'

export const createMedicationLogSchema = z
    .object({
        patientId: z.string().min(1, 'Patient ID is required'),
        medicationId: z.string().min(1, 'Medication ID is required'),
        status: z.enum(['on_time', 'taken_late', 'skipped']),
        takenTime: z.string().datetime(),
        route: z.string().min(1, 'Route is required'),
        observations: z.string().optional(),
    })
    .strict()

export type CreateMedicationLogDTO = z.infer<typeof createMedicationLogSchema>
