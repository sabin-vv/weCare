import { z } from 'zod'

export const loginSchema = z.object({
    email: z.string().min(1, 'Please enter an email').email('Invalid email address'),
    password: z
        .string()
        .min(1, 'Password cannot be empty')
        .min(8, 'Password must be minimum 8 characters')
        .regex(/[a-z]/, 'password contain minimum one lowercase letter')
        .regex(/[A-Z]/, 'password contain Minimum one Uppercase letter')
        .regex(/[0-9]/, 'password contain minimum one number'),
})
