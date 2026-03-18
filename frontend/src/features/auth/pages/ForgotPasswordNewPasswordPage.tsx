import type { FC } from 'react'

import FormLayout from '../../../layouts/FormLayout'
import ForgotPasswordNewPasswordForm from '../forms/forgotPassword/ForgotPasswordNewPasswordForm'

const ForgotPasswordNewPasswordPage: FC = () => {
    return (
        <FormLayout>
            <ForgotPasswordNewPasswordForm />
        </FormLayout>
    )
}

export default ForgotPasswordNewPasswordPage
