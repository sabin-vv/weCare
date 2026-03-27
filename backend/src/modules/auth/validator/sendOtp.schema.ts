import { z } from 'zod'

import { emailschema } from '../../../core/validation/common.schema'
import { OtpRequestPurpose } from '../types/otp.types'

export const SendOtpSchema = z.object({
    email: emailschema,
    purpose: z.enum([OtpRequestPurpose.REGISTER, OtpRequestPurpose.PASSWORD_RESET, OtpRequestPurpose.ACCOUNT_RECOVERY]),
})

export const verifyOtpSchema = z.object({
    email: emailschema,
    otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must be numeric'),
})
