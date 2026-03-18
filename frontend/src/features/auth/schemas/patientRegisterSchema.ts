import { isValidPhoneNumber } from 'libphonenumber-js'
import { z } from 'zod'

const today = new Date()
const minDate = new Date()
minDate.setFullYear(today.getFullYear() - 100)

export const patientRegisterSchema = z
    .object({
        name: z
            .string()
            .min(1, 'Please enter a name')
            .min(3, 'Name must be minimum 3 characterrs')
            .regex(/^[a-zA-Z\s]+$/, 'Only letters are allowed'),
        email: z.string().min(1, 'Please enter an email').email('Invalid email address'),
        dateOfBirth: z
            .string()
            .min(1, 'Date of birth is required')
            .refine(
                (date) => {
                    const dob = new Date(date)
                    return dob <= today && dob >= minDate
                },
                { message: 'Date must be within last 100 years' },
            ),
        gender: z.enum(['male', 'female', 'other'], {
            message: 'Gender is required',
        }),
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
