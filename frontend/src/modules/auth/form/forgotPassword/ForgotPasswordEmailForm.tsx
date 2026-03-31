import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import { sendOtp } from '../../services/auth.service'
import { OtpPurpose } from '../../types/auth.types'

import styles from './ForgotPasswordEmailForm.module.css'

import Button from '@/shared/components/Button/Button'
import FormWrapper from '@/shared/components/FormWrapper/FormWrapper'
import InputField from '@/shared/components/InputField/InputField'
import EmailIcon from '@/shared/icons/EmailIcon'
import { getErrorMessage } from '@/utils/getErrorMessage'

const ForgotPasswordEmailForm = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')

    const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()

        try {
            const result = await sendOtp(email, OtpPurpose.PASSWORD_RESET)

            toast.success(result.message)
            navigate(`/auth/forgot-password/verify-otp?email=${email}`)
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    return (
        <FormWrapper title="Reset your password" description="Enter your email to receive a verification code.">
            <form className={styles.form} onSubmit={onSubmit}>
                <InputField
                    icon={<EmailIcon />}
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="eg. example@email.com"
                    value={email}
                    id="email"
                    onChange={(e) => setEmail(e.target.value)}
                />

                <Button disabled={!email} type="submit">
                    Next
                </Button>

                <div className={styles.actions}>
                    <button className={styles.linkButton} type="button" onClick={() => navigate('/auth/login')}>
                        Back to login
                    </button>
                </div>
            </form>
        </FormWrapper>
    )
}

export default ForgotPasswordEmailForm
