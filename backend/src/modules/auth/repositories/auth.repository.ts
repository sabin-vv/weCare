import Otp from '../model/otp'

export class OtpRepository {
    async createOtp(email: string, otp: string) {
        return Otp.findOneAndUpdate(
            { email },
            { otp, expiredAt: new Date(Date.now() + 10 * 60 * 1000) },
            {
                upsert: true,
                returnDocument: 'after',
            },
        )
    }
    async verifyOtp(email: string, otp: string) {
        return await Otp.findOne({ email, otp }).sort({ crreatedAt: -1 })
    }

    async deleteOtp(email: string) {
        await Otp.deleteMany({ email })
    }
}
