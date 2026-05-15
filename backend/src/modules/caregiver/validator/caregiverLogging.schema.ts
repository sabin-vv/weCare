import { z } from 'zod'

const timeStringSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format')

const optionalNumber = z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) return undefined
    return value
}, z.coerce.number().optional())

export const logMedicationSchema = z.object({
    status: z.enum(['on_time', 'taken_late', 'skipped']),
    takenTime: timeStringSchema,
    route: z.string().trim().min(1, 'Route is required'),
    observations: z.string().trim().optional(),
})

export const logVitalReadingSchema = z.object({
    vitalType: z.enum(['blood_pressure', 'blood_sugar', 'heart_rate', 'temperature', 'oxygen_saturation']),
    systolic: optionalNumber,
    diastolic: optionalNumber,
    value: optionalNumber,
    recordedAt: timeStringSchema,
    notes: z.string().trim().optional(),
})

export const logSymptomSchema = z.object({
    symptom: z.string().trim().min(1, 'Symptom is required'),
    onsetTime: timeStringSchema,
    severity: z.enum(['mild', 'moderate', 'severe', 'critical']),
    observations: z.string().trim().optional(),
})

export type LogMedicationDTO = z.infer<typeof logMedicationSchema>
export type LogVitalReadingDTO = z.infer<typeof logVitalReadingSchema>
export type LogSymptomDTO = z.infer<typeof logSymptomSchema>
