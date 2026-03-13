import { z } from 'zod'

export const doctorStepThreeSchema = z.object({
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
                name: z.string().trim().min(1, 'specialization name cannot be empty'),
                document: z.instanceof(File, {
                    message: 'please upload specialization documents',
                }),
            }),
        )
        .min(1, 'Add atleast one specialization'),
})
