import { z } from 'zod'

export const caregiverRegisterSchema = z
    .object({
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
        password: z
            .string()
            .min(1, 'Password cannot be empty')
            .min(8, 'Password must be minimum 8 characters')
            .regex(/[a-z]/, 'password contain minimum one lowercase letter')
            .regex(/[A-Z]/, 'password contain Minimum one Uppercase letter')
            .regex(/[0-9]/, 'password contain minimum one number'),
        confirmPassword: z.string().min(1, 'confirm password cannot be empty'),
        certificateNumber: z.string().min(3, 'Invalid cerificate number').max(10, 'Invalid certificate number'),
        licenseNumber: z.string().min(3, 'Invalid cerificate number').max(12, 'Invalid license number'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'password do not match',
        path: ['confirmPassword'],
    })
