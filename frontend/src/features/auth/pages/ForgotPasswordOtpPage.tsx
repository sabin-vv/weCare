import type { FC } from 'react'

import FormLayout from '../../../layouts/FormLayout'
import ForgotPasswordOtpForm from '../forms/forgotPassword/ForgotPasswordOtpForm'

const ForgotPasswordOtpPage: FC = () => {
    return (
        <FormLayout>
            <ForgotPasswordOtpForm />
        </FormLayout>
    )
}

export default ForgotPasswordOtpPage
