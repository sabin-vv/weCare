import { isValidPhoneNumber } from 'libphonenumber-js'
import { z } from 'zod'

export const emailSchema = z.string().min(1, 'Email is required').email('Invalid email address')

export const phoneSchema = z
    .string()
    .min(1, 'Phone number cannot be empty')
    .refine((val) => isValidPhoneNumber(val), { message: 'Invalid Phone Number' })

export const nameSchema = z
    .string()
    .trim()
    .min(1, 'Name cannot be empty')
    .min(3, 'Name must be minimum 3 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Only letters are allowed')

export const passwordSchema = z
    .string()
    .min(1, 'Password cannot be empty')
    .min(8, 'Password must be minimum 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')

export const genderSchema = z.string().min(1, 'Gender is required')

export const dateOfBirthSchema = z.string().min(1, 'Date of birth is required')

export const confirmPasswordSchema = z.string().min(1, 'confirm password cannot be empty')
