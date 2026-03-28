import z from 'zod'

import { resetPasswordSchema } from '../validator/auth.schema'

export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>
