import z from 'zod'

import { emailschema, mobileSchema, nameSchema, passwordSchema } from '../../../core/validation/common.schema'

export const registerPatientSchema = z.object({
    name: nameSchema,
    email: emailschema,
    mobile: mobileSchema,
    password: passwordSchema,
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender: z.string().min(1, 'Gender is required'),
})

export type RegisterPatientDTO = z.infer<typeof registerPatientSchema>
