import { z } from 'zod'

export const updateMedicalRecordSchema = z.object({
    allergies: z.array(z.string()).optional(),
    pastSurgeries: z.string().optional(),
})

export const addClinicalNoteSchema = z.object({
    note: z.string().min(1, 'Note is required'),
})
