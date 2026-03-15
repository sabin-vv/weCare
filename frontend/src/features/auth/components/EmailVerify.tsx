/* eslint-disable react/no-unescaped-entities */
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'

import { sendOtp, verifyOtp } from '../services/auth.service'
import type { EmailVerifyProps } from '../types/auth.types'

import styles from './EmailVerify.module.css'

import Button from '@/shared/components/Button/Button'
import { getErrorMessage } from '@/utils/getErrorMessage'

const EmailVerify = ({ email, prevStep, nextStep }: EmailVerifyProps) => {
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
    const resendOtp = async () => {
        try {
            const result = await sendOtp(email)
            if (!result.success) {
                toast.error(result.message)
            }
            toast.success('OTP resend successfully')
        } catch (error) {
            toast.error(getErrorMessage(error))
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
                        {' '}
                        {timer === 0 ? (
                            <p onClick={resendOtp} className={styles.resendCode}>
                                Resend Code
                            </p>
                        ) : (
                            ` Resend code in: ${timer} sec`
                        )}{' '}
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
