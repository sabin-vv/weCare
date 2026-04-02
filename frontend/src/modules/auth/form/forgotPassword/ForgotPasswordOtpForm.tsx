import { useState } from 'react'
import toast from 'react-hot-toast'
import { useLocation, useNavigate } from 'react-router-dom'

import { sendOtp, verifyOtp } from '../../api/auth.api'
import OtpVerification from '../../components/OtpVerification'
import { OtpPurpose } from '../../types/auth.types'
import { getErrorMessage } from '@/utils/getErrorMessage'

const ForgotPasswordOtpForm = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)

    const email = location.state?.email

    if (!email) {
        navigate('/auth/forgot-password')
        return null
    }

    const handleVerify = async (otp: string) => {
        setIsLoading(true)
        try {
            await verifyOtp(email, otp)
            toast.success('Email verified successfully')
            navigate(`/auth/forgot-password/new-password`, { state: { email } })
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
