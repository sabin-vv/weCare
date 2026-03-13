import Button from '@/shared/components/Button/Button'
import type { EmailVerifyProps } from '../types/auth.types'
import styles from './EmailVerify.module.css'
import { useRef } from 'react'
import { verifyOtp } from '../services/auth.service'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/utils/getErrorMessage'

const EmailVerify = ({ email, prevStep, nextStep }: EmailVerifyProps) => {
    const inputRef = useRef<(HTMLInputElement | null)[]>([])
    const handleChange = async (value: string, index: number) => {
        if (!/^[0-9]?$/.test(value)) {
            return
        }

        if (value && index < 5) {
            inputRef.current[index + 1]?.focus()
        }
    }
    const handleVerify = async () => {
        try {
            const otp = inputRef.current.map((digit) => digit?.value).join('')
            if (otp.length !== 6) {
                toast.error('Please enter 6 digit OTP')
                return
            }
            const res = await verifyOtp(email, otp)
            if (!res.success) {
                toast.error(res.message)
                return
            }
            toast.success(res.message)
        } catch (error: unknown) {
            toast.error(getErrorMessage(error))
            return
        }
        nextStep()
    }
    return (
        <div className={styles.cardWrapper}>
            <div className={styles.title}>
                <p>We’ve sent a 6-digit verification code to </p>
                <p className={styles.emailAddress}> {email}</p>
            </div>
            <div className={styles.digitBox}>
                {[...Array(6)].map((_, index) => (
                    <input
                        key={index}
                        ref={(el) => {
                            inputRef.current[index] = el
                        }}
                        type="text"
                        maxLength={1}
                        inputMode="numeric"
                        onChange={(e) => {
                            handleChange(e.target.value, index)
                        }}
                    />
                ))}
            </div>
            <Button type="button" onClick={handleVerify}>
                {'Verify & Continue'}
            </Button>
            <div className={styles.cardFooter}>
                <div className={styles.resendCode}>
                    <p>Resend code in:</p> <p> 00.30 sec</p>
                </div>
                <p onClick={prevStep} className={styles.changeEmail}>
                    Change email
                </p>
            </div>
        </div>
    )
}

export default EmailVerify
