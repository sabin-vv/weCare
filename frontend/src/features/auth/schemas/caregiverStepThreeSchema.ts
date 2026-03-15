import { z } from 'zod'

export const caregiverStepThreeSchema = z.object({
    documents: z.object({
        govId: z.instanceof(File, {
            message: 'Please upload a Government ID',
        }),
        profileImage: z.instanceof(File, {
            message: 'Please upload your profile image',
        }),
        certificate: z.object({
            number: z.string().trim().min(1, 'Enter Professional certificate number'),
            document: z.instanceof(File, {
                message: 'Please upload your professional certificate',
            }),
        }),
        licence: z.object({
            number: z.string().trim().min(1, 'Enter your Nursing license number'),
            document: z.instanceof(File, {
                message: 'Please upload your nursing license document',
            }),
        }),
    }),
})
