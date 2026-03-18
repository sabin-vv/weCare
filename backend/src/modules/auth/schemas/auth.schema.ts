import { z } from 'zod'

export const sendOtpSchema = z.object({
    email: z.string().email(),
    purpose: z.enum(['email-verification', 'password-reset', 'account-recovery']),
})

export const verifyOtpSchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6).regex(/^\d+$/),
})
