import z from 'zod'

export const createCaregiverProfileSchema = z.object({
    certificateNumber: z.string().min(1, 'Certificate number is required'),
    licenseNumber: z.string().min(1, 'License number is required'),
    govIdImage: z.string().min(1, 'Government ID is required'),
    profileImage: z.string().min(1, 'Profile image is required'),
    certificateImage: z.string().min(1, 'Certificate document is required'),
    licenseImage: z.string().min(1, 'License document is required'),
})

export type CreateCaregiverProfileDTO = z.infer<typeof createCaregiverProfileSchema>
