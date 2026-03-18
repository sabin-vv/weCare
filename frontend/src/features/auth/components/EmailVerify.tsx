/* eslint-disable react/no-unescaped-entities */
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'

import { sendOtp, verifyOtp } from '../services/auth.service'
import { type EmailVerifyProps } from '../types/auth.types'

import styles from './EmailVerify.module.css'

import Button from '@/shared/components/Button/Button'
import { getErrorMessage } from '@/utils/getErrorMessage'

const EmailVerify = ({ email, prevStep, nextStep, purpose }: EmailVerifyProps) => {
    const [otpSent, setOtpSend] = useState<boolean>(false)
    const [timer, setTimer] = useState<number>(30)
    const inputRef = useRef<(HTMLInputElement | null)[]>([])

    useEffect(() => {
        if (timer <= 0) return
        const intervalId = setInterval(() => {
            setTimer((prev) => prev - 1)
        }, 1000)

        return () => clearInterval(intervalId)
    }, [timer])
    const handleChange = async (value: string, index: number) => {
        if (!/^[0-9]?$/.test(value)) {
            return
        }

        if (value && index < 5) {
            inputRef.current[index + 1]?.focus()
        }
    }
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace') {
            const currentValue = inputRef.current[index]?.value

            if (!currentValue && index > 0) {
                inputRef.current[index - 1]?.focus()
            }
        }
    }

    const handleVerify = async () => {
        try {
            const otp = inputRef.current.map((digit) => digit?.value).join('')
            if (otp.length !== 6) {
                toast.error('Please enter 6 digit OTP')
                return
            }
            const result = await verifyOtp(email, otp)

            toast.success(result.message)
        } catch (error: unknown) {
            toast.error(getErrorMessage(error))
            return
        }
        nextStep()
    }
    const resendOtp = async () => {
        try {
            setOtpSend(true)
            const result = await sendOtp(email, purpose)

            toast.success(result.message)
            setTimer(30)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setOtpSend(false)
        }
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
                        onKeyDown={(e) => handleKeyDown(e, index)}
                    />
                ))}
            </div>
            <Button type="button" onClick={handleVerify}>
                {'Verify & Continue'}
            </Button>
            <div className={styles.cardFooter}>
                <div className={styles.resendCode}>
                    <p>Didn't receive the code?</p>
                    <p>
                        {timer === 0 ? (
                            <p onClick={resendOtp} className={otpSent ? styles.resendCodeDisable : styles.resendCode}>
                                Resend Code
                            </p>
                        ) : (
                            <span>Resend code in : {timer} sec</span>
                        )}
                    </p>
                </div>
                <p onClick={prevStep} className={styles.changeEmail}>
                    Change email
                </p>
            </div>
        </div>
    )
}

export default EmailVerify
