import { z } from 'zod'

import { emailschema, mobileSchema, nameSchema, passwordSchema } from '../../../core/validation/common.schema'
import { UserRole } from '../types/auth.types'

export const loginSchema = z.object({
    email: emailschema,
    password: z.string().min(8, 'The password must bt atleast 8 character'),
    role: z.enum([UserRole.DOCTOR, UserRole.ADMIN, UserRole.CAREGIVER, UserRole.PATIENT]),
})

export const resetPasswordSchema = z.object({
    email: emailschema,
    newPassword: passwordSchema,
})

export const changePasswordSchema = z.object({
    currentPassword: z.string(),
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

export type LoginDTO = z.infer<typeof loginSchema>
export type RegisterDTO = z.infer<typeof registerSchema>
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>
export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>
