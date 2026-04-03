import { z } from 'zod'

import { Role } from '../types/auth.types'

import {
    confirmPasswordSchema,
    dateOfBirthSchema,
    emailSchema,
    genderSchema,
    nameSchema,
    passwordSchema,
    phoneSchema,
} from '@/shared/validators/common.schema'

export const loginSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    role: z.enum([Role.CAREGIVER, Role.DOCTOR, Role.PATIENT, Role.ADMIN]),
})

export const basicInfoSchema = z
    .object({
        name: z
            .string()
            .trim()
            .transform((val) => val.replace(/^dr\.?\s*/i, ''))
            .refine((val) => val.length > 0, 'Name cannot be empty')
            .refine((val) => val.length >= 3, 'Name must be minimum 3 characters')
            .refine((val) => /^[a-zA-Z\s]+$/.test(val), 'Only letters are allowed'),
        email: emailSchema,
        mobile: phoneSchema,
        password: passwordSchema,
        confirmPassword: confirmPasswordSchema,
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'password do not match',
        path: ['confirmPassword'],
    })

export const doctorDetailesSchema = z.object({
    documents: z.object({
        govId: z.instanceof(File, {
            message: 'Please upload a Government ID',
        }),
        profileImage: z.instanceof(File, {
            message: 'Please upload your profile image',
        }),
        medicalCertificate: z.object({
            number: z.string().trim().min(1, 'Enter Medical certificate number'),
            document: z.instanceof(File, {
                message: 'upload your medical cerificate',
            }),
        }),
        councilRegistration: z.object({
            number: z.string().trim().min(1, 'Enter your Medical council Registration number'),
            document: z.instanceof(File, {
                message: 'Please upload your medical council document',
            }),
        }),
    }),
    specializations: z
        .array(
            z.object({
                name: z
                    .string()
                    .trim()
                    .min(1, 'specialization name cannot be empty')
                    .regex(/^[a-zA-Z\s]+$/, 'Specialization name should be in letters'),
                document: z.instanceof(File, {
                    message: 'please upload specialization documents',
                }),
            }),
        )
        .min(1, 'Add atleast one specialization'),
})

export const caregiverDetailsSchema = z.object({
    documents: z.object({
        govId: z.instanceof(File, {
            message: 'Please upload a Government ID',
        }),
        profileImage: z.instanceof(File, {
            message: 'Please upload your profile image',
        }),
        certificate: z.object({
            number: z.string().trim().min(1, 'Enter certificate number'),
            document: z.instanceof(File, {
                message: 'Please upload your certificate document',
            }),
        }),
        license: z.object({
            number: z.string().trim().min(1, 'Enter license number'),
            document: z.instanceof(File, {
                message: 'Please upload your license document',
            }),
        }),
    }),
})

export const patientRegisterSchema = z
    .object({
        name: nameSchema,
        email: emailSchema,
        mobile: phoneSchema,
        password: passwordSchema,
        confirmPassword: confirmPasswordSchema,
        dateOfBirth: dateOfBirthSchema,
        gender: genderSchema,
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })

export const resetPasswordSchema = z
    .object({
        newPassword: passwordSchema,
        confirmNewPassword: confirmPasswordSchema,
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
        message: 'password do not match',
        path: ['confirmNewPassword'],
    })

export type PatientRegisterData = z.infer<typeof patientRegisterSchema>

export type BasicInfoDTO = z.infer<typeof basicInfoSchema>

export type DoctorDetailesDTO = z.infer<typeof doctorDetailesSchema>

export type CaregiverDetailsDTO = z.infer<typeof caregiverDetailsSchema>
