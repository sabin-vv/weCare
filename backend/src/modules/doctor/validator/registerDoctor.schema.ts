import { z } from 'zod'

import { emailschema, mobileSchema, nameSchema, passwordSchema } from '../../../core/validation/common.schema'

export const registerDoctorSchema = z.object({
    name: nameSchema,
    email: emailschema,
    mobile: mobileSchema,
    password: passwordSchema,
    medicalCertificateNumber: z.string().min(1, 'Medical certificate number is required'),
    medicalCouncilRegisterNumber: z.string().min(1, 'Medical council register number required'),

    profileImage: z.string().min(1).optional(),
    medicalCertificateImage: z.string().min(1).optional(),
    medicalCouncilImage: z.string().min(1).optional(),

    specializationDocumentKeys: z
        .string()
        .transform((val) => JSON.parse(val))
        .pipe(z.array(z.string().min(1).nullable()))
        .optional(),
    specializations: z
        .string()
        .transform((val) => JSON.parse(val))
        .pipe(
            z.array(
                z.object({
                    name: z.string(),
                }),
            ),
        ),
})

export type RegisterDoctorDTO = z.infer<typeof registerDoctorSchema>
