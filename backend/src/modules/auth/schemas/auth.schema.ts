import { z } from 'zod'

import { emailBase, passwordBase } from '../../../schemas/schema'

export const ROLES = ['doctor', 'caregiver', 'admin', 'patient'] as const

export const sendOtpSchema = z.object({
    email: emailBase,
    purpose: z.enum(['email-verification', 'password-reset', 'account-recovery']),
})

export const verifyOtpSchema = z.object({
    email: emailBase,
    otp: z.string().length(6).regex(/^\d+$/),
})
export const resetPasswordSchema = z.object({
    email: emailBase,
    password: passwordBase,
})
export const loginSchema = z.object({
    email: emailBase,
    password: passwordBase,
    role: z.enum(ROLES),
})
