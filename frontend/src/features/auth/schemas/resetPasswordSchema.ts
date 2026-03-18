import { z } from 'zod'

export const resetPaswordSchema = z
    .object({
        newPassword: z
            .string()
            .min(1, 'Password cannot be empty')
            .min(8, 'Password must be minimum 8 characters')
            .regex(/[a-z]/, 'password contain minimum one lowercase letter')
            .regex(/[A-Z]/, 'password contain Minimum one Uppercase letter')
            .regex(/[0-9]/, 'password contain minimum one number'),
        confirmNewPassword: z.string().min(1, 'confirm password cannot be empty'),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
        message: 'password do not match',
        path: ['confirmPassword'],
    })
