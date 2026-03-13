import nodemailer from 'nodemailer'
import env from '../../../config/env'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: env.email.user,
        pass: env.email.password,
    },
})

export const sendEmail = async (email: string, otp: string) => {
    const mailOptions = {
        from: env.email.user,
        to: email,
        subject: 'WeCare Email Verification',
        html: `
<div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:40px 0;">
  <div style="max-width:500px; margin:auto; background:white; padding:30px; border-radius:8px; text-align:center; box-shadow:0 2px 6px rgba(0,0,0,0.1);">

    <h2 style="color:#333; margin-bottom:10px;">
      Email Verification
    </h2>

    <p style="color:#555; font-size:16px;">
      Your verification code is
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
    }
    await transporter.sendMail(mailOptions)
}

export const generateOtp = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString()
}
