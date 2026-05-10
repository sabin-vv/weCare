import { z } from 'zod'

export const createVitalSchema = z
    .object({
        patientId: z.string().min(1, 'Patient ID is required'),
        type: z.enum(['blood_sugar', 'blood_pressure', 'spo2', 'heart_rate']),
        value: z.number().optional(),
        systolic: z.number().optional(),
        diastolic: z.number().optional(),
        unit: z.string().min(1, 'Unit is required'),
        recordedAt: z.string().datetime().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.type === 'blood_pressure') {
            if (data.systolic === undefined) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'Systolic value is required for blood pressure',
                    path: ['systolic'],
                })
            }
            if (data.diastolic === undefined) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'Diastolic value is required for blood pressure',
                    path: ['diastolic'],
                })
            }
        } else if (data.value === undefined) {
            ctx.addIssue({
                code: 'custom',
                message: 'Value is required for the selected vital type',
                path: ['value'],
            })
        }
    })

export type CreateVitalDTO = z.infer<typeof createVitalSchema>
