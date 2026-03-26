import { z } from 'zod'

import { registerDoctorSchema } from '../validator/doctor.schema'

export type RegisterDoctorDTO = z.infer<typeof registerDoctorSchema>
