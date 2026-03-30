import { z } from 'zod'

const allowedContentTypes = ['image/png', 'image/jpeg', 'application/pdf'] as const

export const uploadsPresignSchema = z.object({
    fileName: z.string().min(1, 'fileName is required'),
    contentType: z.enum(allowedContentTypes),
    folder: z.string().min(1).optional().default('uploads'),
    size: z.number().int().positive().optional(),
})

export type UploadsPresignDTO = z.infer<typeof uploadsPresignSchema>

