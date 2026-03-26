import { isValidPhoneNumber } from 'libphonenumber-js'
import { z } from 'zod'

export const nameSchema = z.string().min(1, 'Name is required')

export const emailschema = z.string().trim().toLowerCase().min(1, 'Email is required').email('Invalid emial')

export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password  is too long')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')

export const mobileSchema = z
    .string()
    .refine((value) => isValidPhoneNumber(`+${value}`), { message: 'Invalid Phone Number' })
