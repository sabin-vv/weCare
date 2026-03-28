import { z } from 'zod'

import { emailschema, passwordSchema } from '../../../core/validation/common.schema'
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
