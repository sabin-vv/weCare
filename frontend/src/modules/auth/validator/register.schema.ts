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

export type BasicInfoDTO = z.infer<typeof basicInfoSchema>

export type DoctorDetailesDTO = z.infer<typeof doctorDetailesSchema>

export type CaregiverDetailsDTO = z.infer<typeof caregiverDetailsSchema>
