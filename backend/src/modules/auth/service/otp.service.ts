import { injectable } from 'tsyringe'

import { env } from '../../../core/config/env'
import { transporter } from '../../../core/config/mailer'
import { redis } from '../../../core/config/redis'
import { AppError } from '../../../core/errors/AppError'
import { OtpRequestPurpose } from '../types/otp.types'

@injectable()
export class OtpService {
    generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString()
    }

    async sendOtp(email: string, purpose: OtpRequestPurpose): Promise<void> {
        const otp = this.generateOtp()

        const redisKey = `otp:${email}`
        const ttlSeconds = 10 * 60

        const { subject, title, message } = (() => {
            switch (purpose) {
                case OtpRequestPurpose.REGISTER:
                    return {
                        subject: 'WeCare Email Verification',
                        title: 'Email Verification',
                        message: 'Your verification code is',
                    }
                case OtpRequestPurpose.PASSWORD_RESET:
                    return {
                        subject: 'WeCare Password Reset',
                        title: 'Password Reset',
                        message: 'Your password reset code is',
                    }
                case OtpRequestPurpose.ACCOUNT_RECOVERY:
                    return {
                        subject: 'WeCare Account Recovery',
                        title: 'Account Recovery',
                        message: 'Your recovery code is',
                    }
                default:
                    return {
                        subject: 'WeCare OTP',
                        title: 'Your Verification Code',
                        message: 'Your verification code is',
                    }
            }
        })()

        try {
            await redis.del(redisKey)
            await redis.set(redisKey, otp, 'EX', ttlSeconds)

            await transporter.sendMail({
                from: env.EMAIL_USER,
                to: email,
                subject,
                html: `
<div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:40px 0;">
  <div style="max-width:500px; margin:auto; background:white; padding:30px; border-radius:8px; text-align:center; box-shadow:0 2px 6px rgba(0,0,0,0.1);">

    <h2 style="color:#333; margin-bottom:10px;">
      ${title}
    </h2>

    <p style="color:#555; font-size:16px;">
      ${message}
    </p>

    <div style="font-size:32px; font-weight:bold; letter-spacing:8px; color:#2d7ff9; margin:20px 0;">
      ${otp}
    </div>

    <p style="color:#777; font-size:14px;">
      This OTP will expire in <b>10 minutes</b>.
    </p>

    <p style="color:#999; font-size:12px; margin-top:30px;">
      If you did not request this code, you can safely ignore this email.
    </p>

  </div>
</div>
`,
            })
        } catch (error) {
            throw new AppError(500, error)
        }
    }

    async verifyOtp(email: string, otp: string) {
        const storedOtp = await redis.get(`otp:${email}`)

        if (!storedOtp) {
            throw new AppError(400, 'OTP Expired')
        }
        if (storedOtp !== otp) {
            throw new AppError(400, 'Invalid OTP')
        }
        await redis.del(`otp:${email}`)
    }
}
