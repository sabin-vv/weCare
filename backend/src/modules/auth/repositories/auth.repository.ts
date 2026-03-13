import Otp from '../model/otp'

export class OtpRepository {
    async createOtp(email: string, otp: string) {
        return Otp.create({ email, otp, expiredAt: new Date(Date.now() + 10 * 60 * 1000) })
    }
    async verifyOtp(email: string, otp: string) {
        return await Otp.findOne({ email, otp })
    }

    async deleteOtp(email: string) {
        await Otp.deleteMany({ email })
    }
}
