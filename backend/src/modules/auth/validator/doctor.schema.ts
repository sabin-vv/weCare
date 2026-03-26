import { z } from 'zod'

import { emailschema, mobileSchema, nameSchema, passwordSchema } from '../../../core/validation/common.schema'

export const registerDoctorSchema = z.object({
    name: nameSchema,
    email: emailschema,
    mobile: mobileSchema,
    password: passwordSchema,
    medicalCertificateNumber: z.string().min(1, 'Medical certificate number is required'),
    medicalCouncilRegistrationNumber: z.string().min(1, 'Medical council register number required'),
    specializations: z
        .string()
        .transform((val) => JSON.parse(val))
        .refine((arr) => Array.isArray(arr), {
            message: 'Invalid specialization format',
        }),
})
