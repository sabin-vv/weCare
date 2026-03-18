import type { FC } from 'react'

import FormLayout from '../../../layouts/FormLayout'
import ForgotPasswordEmailForm from '../forms/forgotPassword/ForgotPasswordEmailForm'

const ForgotPasswordEmailPage: FC = () => {
    return (
        <FormLayout>
            <ForgotPasswordEmailForm />
        </FormLayout>
    )
}

export default ForgotPasswordEmailPage
