import { useEffect, useRef, useState, type KeyboardEvent } from 'react'

import Button from '@/shared/components/Button/Button'
import styles from './OtpVerification.module.css'
import type { OtpVerificationProps } from '../types/auth.types'
import FormWrapper from '@/shared/components/FormWrapper/FormWrapper'
import ProgressBar from './ProgressBar'

const OtpVerification = ({ email, onVerify, onResend, onBack, loading }: OtpVerificationProps) => {
    const [timer, setTimer] = useState(30)
    const [resending, setResending] = useState(false)
    const inputRef = useRef<(HTMLInputElement | null)[]>([])

    useEffect(() => {
        if (timer <= 0) return
        const id = setInterval(() => setTimer((prev) => prev - 1), 1000)
        return () => clearInterval(id)
    }, [timer])

    const handleChange = (value: string, index: number) => {
        if (!/^[0-9]?$/.test(value)) return

        if (value && index < 5) {
            inputRef.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !inputRef.current[index]?.value && index > 0) {
            inputRef.current[index - 1]?.focus()
        }
    }

    const handleVerifyClick = async () => {
        const otp = inputRef.current.map((d) => d?.value).join('')
        if (otp.length !== 6) return
        await onVerify(otp)
    }

    const handleResend = async () => {
        setResending(true)
        await onResend()
        setTimer(30)
        setResending(false)
    }

    return (
        <FormWrapper
            maxWidth="520px"
            title="Verify your email"
            description="Please enter verification code was just sent to your email"
        >
            <ProgressBar step={2} totalSteps={4} percentage={50} title="Verify your email address" />
            <p>
                We’ve sent a 6-digit code to <strong>{email}</strong>
            </p>

            <div className={styles.digitBox}>
                {[...Array(6)].map((_, i) => (
                    <input
                        key={i}
                        ref={(el) => {
                            inputRef.current[i] = el
                        }}
                        maxLength={1}
                        inputMode="numeric"
                        onChange={(e) => handleChange(e.target.value, i)}
                        onKeyDown={(e) => handleKeyDown(e, i)}
                    />
                ))}
            </div>

            <Button onClick={handleVerifyClick} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Continue'}
            </Button>

            <div className={styles.cardFooter}>
                {timer === 0 ? (
                    <button className={styles.resendCode} onClick={handleResend} disabled={resending}>
                        {resending ? 'Sending...' : 'Resend Code'}
                    </button>
                ) : (
                    <button className={styles.resendCode} disabled>
                        Resend in {timer}s
                    </button>
                )}

                {onBack && (
                    <button className={styles.changeEmail} onClick={onBack}>
                        Change email
                    </button>
                )}
            </div>
        </FormWrapper>
    )
}

export default OtpVerification
