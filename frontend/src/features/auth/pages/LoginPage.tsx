import type { FC } from 'react'

import FormLayout from '../../../layouts/FormLayout'
import LoginForm from '../forms/login/LoginForm'

const LoginPage: FC = () => {
    return (
        <FormLayout>
            <LoginForm />
        </FormLayout>
    )
}

export default LoginPage
