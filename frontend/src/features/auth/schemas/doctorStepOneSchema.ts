import { z } from 'zod'
import { isValidPhoneNumber } from 'libphonenumber-js'

export const doctorStepOneSchema = z
    .object({
        name: z
            .string()
            .min(1, 'Name cannot be empty')
            .min(3, 'Name must be minimum 3 characterrs')
            .regex(/^[a-zA-Z\s]+$/, 'Only letters are allowed'),
        email: z.string().min(1, 'email cannot be empty').email('Invalid email address'),
        mobile: z
            .string()
            .min(1, 'Phone number cannot be empty')
            .refine((val) => isValidPhoneNumber(`+${val}`), { message: 'Invalid Phone Number' }),
        password: z
            .string()
            .min(1, 'Password cannot be empty')
            .min(8, 'Password must be minimum 8 characters')
            .regex(/[a-z]/, 'password contain minimum one lowercase letter')
            .regex(/[A-Z]/, 'password contain Minimum one Uppercase letter')
            .regex(/[0-9]/, 'password contain minimum one number'),
        confirmPassword: z.string().min(1, 'confirm password cannot be empty'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'password do not match',
        path: ['confirmPassword'],
    })
