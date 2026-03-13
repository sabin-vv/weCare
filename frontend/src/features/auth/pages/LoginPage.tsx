import type { FC } from 'react'
import LoginForm from '../forms/login/LoginForm'
import FormLayout from '../../../layouts/FormLayout'

const LoginPage: FC = () => {
    return (
        <FormLayout>
            <LoginForm />
        </FormLayout>
    )
}

export default LoginPage
