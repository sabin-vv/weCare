import { z } from 'zod'
export const emailBase = z.string().trim().toLowerCase().min(1, 'Email is required').email('Invalid email')

export const passwordBase = z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
