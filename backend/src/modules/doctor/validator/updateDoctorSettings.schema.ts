import { z } from 'zod'

import { emailschema, mobileSchema, nameSchema } from '../../../core/validation/common.schema'

export const UpdateDoctorSettingsSchema = z.object({
    fullName: nameSchema,
    consultationFee: z.coerce.number().min(0, 'Consultation fee must be zero or greater'),
    phoneNumber: mobileSchema,
    email: emailschema,
    isActive: z.boolean().optional(),
})

export type UpdateDoctorSettingsDTO = z.infer<typeof UpdateDoctorSettingsSchema>
