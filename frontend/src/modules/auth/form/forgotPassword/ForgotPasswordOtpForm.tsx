import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { sendOtp, verifyOtp } from '../../api/auth.api'
import OtpVerification from '../../components/OtpVerification'
import { OtpPurpose } from '../../types/auth.types'
import { getErrorMessage } from '@/utils/getErrorMessage'

const ForgotPasswordOtpForm = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)

    const email = searchParams.get('email') || ''

    if (!email) {
        navigate('/auth/forgot-password')
        return null
    }

    const handleVerify = async (otp: string) => {
        setIsLoading(true)
        try {
            await verifyOtp(email, otp)
            toast.success('Email verified successfully')
            navigate(`/auth/forgot-password/new-password?email=${email}`)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }

    const handleResend = async () => {
        try {
            await sendOtp(email, OtpPurpose.PASSWORD_RESET)
            toast.success('Verification code resent')
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    return (
        <OtpVerification
            email={email}
            onVerify={handleVerify}
            onResend={handleResend}
            onBack={() => navigate('/auth/forgot-password')}
            loading={isLoading}
        />
    )
}

export default ForgotPasswordOtpForm
