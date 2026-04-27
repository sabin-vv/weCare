import { z } from 'zod'

import { emailschema, mobileSchema, nameSchema } from '../../../core/validation/common.schema'

export const UpdateDoctorSettingsSchema = z.object({
    fullName: nameSchema.optional(),
    consultationFee: z.coerce.number().min(0, 'Consultation fee must be zero or greater').optional(),
    phoneNumber: mobileSchema.optional(),
    email: emailschema.optional(),
    isActive: z.coerce.boolean().optional(),
    profileImage: z.string().optional(),
    govIdImage: z.string().min(1, 'Government ID is required').optional(),
    medicalCertificateNumber: z.string().min(1, 'Medical certificate number is required').optional(),
    medicalCertificateImage: z.string().min(1, 'Medical certificate image is required').optional(),
    medicalCouncilRegisterNumber: z.string().min(1, 'Medical council register number required').optional(),
    medicalCouncilImage: z.string().min(1, 'Medical council document is required').optional(),
    specializationDocumentKeys: z
        .string()
        .transform((val) => JSON.parse(val))
        .pipe(z.array(z.string().min(1, 'Document key is required')).min(1, 'At least one specialization document is required'))
        .optional(),
    specializations: z
        .string()
        .transform((val) => JSON.parse(val))
        .pipe(
            z
                .array(
                    z.object({
                        name: z.string().min(1, 'Specialization name is required'),
                    }),
                )
                .min(1, 'At least one specialization is required'),
        )
        .optional(),
})

export type UpdateDoctorSettingsDTO = z.infer<typeof UpdateDoctorSettingsSchema>
