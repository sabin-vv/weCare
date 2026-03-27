import { z } from 'zod'

import { loginSchema } from '../validator/auth.schema'

export type LoginDTO = z.infer<typeof loginSchema>
