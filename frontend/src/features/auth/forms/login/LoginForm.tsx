import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import Button from '../../../../shared/components/Button/Button'
import InputField from '../../../../shared/components/InputField/InputField'
import PasswordField from '../../../../shared/components/PasswordField/PasswordField'
import RoleSelector from '../../components/RoleSelector'
import { loginSchema } from '../../schemas/loginSchema'
import { loginUser } from '../../services/auth.service'
import { Role } from '../../types/auth.types'

import styles from './LoginForm.module.css'

import FormWrapper from '@/shared/components/FormWrapper/FormWrapper'
import EmailIcon from '@/shared/icons/EmailIcon'
import { getErrorMessage } from '@/utils/getErrorMessage'

const LoginForm = () => {
    const [role, setRole] = useState<Role>(Role.DOCTOR)

    const { register, handleSubmit } = useForm({
        resolver: zodResolver(loginSchema),
    })
    const navigate = useNavigate()

    const formSubmit = async (data: { email: string; password: string }) => {
        try {
            const result = await loginUser(data.email, role)
            toast.success(result.message)
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    return (
        <FormWrapper title="Welcome Back" description="Secure access to your healthcare dashboard">
            <form className={styles.form}>
                <RoleSelector role={role} onChange={setRole} />
                <InputField
                    icon={<EmailIcon />}
                    label="Email Address"
                    type="text"
                    placeholder="eg. example@email.com"
                    id="email"
                    {...register('email')}
                />
                <PasswordField
                    onForgotPassword={() => navigate('/api/auth/forgot-password')}
                    label="Password"
                    type="password"
                    placeholder="********"
                    id="password"
                    {...register('password')}
                />

                <Button type="submit">Sign In</Button>
            </form>
            <button onClick={handleSubmit(formSubmit)} className={styles.patientRegister}>
                Register as Patient
            </button>

            <div className={styles.professionalCard}>
                <h3>Medical Professionals</h3>
                <p>Medical professionals require verification before activation.</p>
                <div className={styles.professioanlRegister}>
                    <button onClick={() => navigate('/api/doctors/register')}>Apply as a Doctor</button>
                    <button onClick={() => navigate('/api/caregivers/register')}>Register as Caregiver</button>
                </div>
            </div>
        </FormWrapper>
    )
}

export default LoginForm
