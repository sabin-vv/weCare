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

export const createCaregiverProfileSchema = z.object({
    email: emailschema.optional(),
    certificateNumber: z.string().min(1, 'Certificate number is required'),
    licenseNumber: z.string().min(1, 'License number is required'),
    govIdImage: z.string().min(1, 'Government ID is required'),
    profileImage: z.string().min(1, 'Profile image is required'),
    certificateImage: z.string().min(1, 'Certificate document is required'),
    licenseImage: z.string().min(1, 'License document is required'),
})

export type RegisterCaregiverDTO = z.infer<typeof registerCaregiverSchema>
export type CreateCaregiverProfileDTO = z.infer<typeof createCaregiverProfileSchema>
