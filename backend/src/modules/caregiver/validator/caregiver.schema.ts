import z from 'zod'

import { emailschema, mobileSchema, nameSchema, passwordSchema } from '../../../core/validation/common.schema'

export const registerCaregiverSchema = z.object({
    name: nameSchema,
    email: emailschema,
    mobile: mobileSchema,
    password: passwordSchema,
    certificateNumber: z.string().min(1, 'certificate number is required'),
    licenseNumber: z.string().min(1, 'License number is required'),

    govIdImage: z.string().min(1).optional(),
    profileImage: z.string().min(1).optional(),
    certificateImage: z.string().min(1).optional(),
    licenseImage: z.string().min(1).optional(),
})

export type RegisterCaregiverDTO = z.infer<typeof registerCaregiverSchema>
