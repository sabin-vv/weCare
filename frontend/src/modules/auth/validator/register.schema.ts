import { isValidPhoneNumber } from 'libphonenumber-js'
import { z } from 'zod'

export const basicInfoSchema = z
    .object({
        name: z
            .string()
            .trim()
            .transform((val) => val.replace(/^dr\.?\s*/i, ''))
            .refine((val) => val.length > 0, 'Name cannot be empty')
            .refine((val) => val.length >= 3, 'Name must be minimum 3 characters')
            .refine((val) => /^[a-zA-Z\s]+$/.test(val), 'Only letters are allowed'),
        email: z.string().min(1, 'email cannot be empty').email('Invalid email address'),
        mobile: z
            .string()
            .min(1, 'Phone number cannot be empty')
            .refine((val) => isValidPhoneNumber(`+${val}`), { message: 'Invalid Phone Number' }),
        password: z
            .string()
            .min(1, 'Password cannot be empty')
            .min(8, 'Password must be minimum 8 characters')
            .regex(/[a-z]/, 'password must contain at least one lowercase letter')
            .regex(/[A-Z]/, 'password must contain at least one Uppercase letter')
            .regex(/[0-9]/, 'password must contain at least one number'),
        confirmPassword: z.string().min(1, 'confirm password cannot be empty'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'password do not match',
        path: ['confirmPassword'],
    })

export type BasicInfoDTO = z.infer<typeof basicInfoSchema>
