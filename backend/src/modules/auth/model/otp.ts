import { model, Schema } from 'mongoose'

import { IOtp } from '../interfaces/authInterface'

const otpSchema = new Schema<IOtp>(
    {
        email: {
            type: String,
            required: true,
            index: true,
        },
        otp: {
            type: String,
            required: true,
        },
        expiredAt: {
            type: Date,
            required: true,
            expires: 0,
        },
    },
    { timestamps: true },
)

const Otp = model<IOtp>('Otp', otpSchema)
export default Otp
