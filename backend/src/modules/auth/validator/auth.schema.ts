import { z } from 'zod'

import { emailschema, mobileSchema, nameSchema, passwordSchema } from '../../../core/validation/common.schema'
import { UserRole } from '../types/auth.types'

export const loginSchema = z.object({
    email: emailschema,
    password: passwordSchema,
    role: z.enum([UserRole.DOCTOR, UserRole.ADMIN, UserRole.CAREGIVER, UserRole.PATIENT]),
})

export const resetPasswordSchema = z.object({
    email: emailschema,
    newPassword: passwordSchema,
})

export const registerSchema = z
    .object({
        name: nameSchema,
        email: emailschema,
        mobile: mobileSchema,
        password: passwordSchema,
        confirmPassword: passwordSchema,
        role: z.enum([UserRole.DOCTOR, UserRole.CAREGIVER, UserRole.PATIENT]),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })

export type registerDTO = z.infer<typeof registerSchema>
