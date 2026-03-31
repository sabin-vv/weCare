import { useNavigate, useSearchParams } from 'react-router-dom'

import EmailVerify from '../../components/EmailVerify'
import { OtpPurpose } from '../../types/auth.types'

import FormWrapper from '@/shared/components/FormWrapper/FormWrapper'

const ForgotPasswordOtpForm = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const email = searchParams.get('email') || ''

    if (!email) {
        navigate('/auth/forgot-password')
        return null
    }

    const handleVerified = () => {
        navigate(`/auth/forgot-password/new-password?email=${email}`)
    }

    return (
        <FormWrapper title="Verify your Email address">
            <EmailVerify
                purpose={OtpPurpose.PASSWORD_RESET}
                email={email}
                prevStep={() => navigate('/auth/forgot-password')}
                nextStep={handleVerified}
            />
        </FormWrapper>
    )
}

export default ForgotPasswordOtpForm
