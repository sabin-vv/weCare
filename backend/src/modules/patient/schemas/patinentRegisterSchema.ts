import { z } from 'zod'

export const patientRegisterSchema = z.object({
    name: z
        .string()
        .min(1, 'Name cannot be empty')
        .min(3, 'Name should be minimun 3 letters')
        .regex(/^[a-zA-Z\s]+$/, 'Only letters are allowed'),
    email: z.string().min(1, 'email cannot be empty').email('Invalid email address'),
    mobile: z
        .string()
        .min(1, 'Phone number cannot be empty')
        .regex(/^\+?\d{10,15}$/, 'Invalid phone number'),
    dateOfBirth: z
        .string()
        .min(1, 'Date of birth is required')
        .refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid date format',
        }),
    gender: z.enum(['male', 'female', 'other'], {
        message: 'Gender must be male, female, or other',
    }),
    password: z
        .string()
        .min(1, 'Password cannot be empty')
        .min(8, 'Password must be minimum 8 characters')
        .regex(/[a-z]/, 'password contain minimum one lowercase letter')
        .regex(/[A-Z]/, 'password contain Minimum one Uppercase letter')
        .regex(/[0-9]/, 'password contain minimum one number'),
    confirmPassword: z.string().min(1, 'confirm password cannot be empty'),
})
