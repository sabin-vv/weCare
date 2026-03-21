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
import { Role, type LoginFormData } from '../../types/auth.types'

import styles from './LoginForm.module.css'

import FormWrapper from '@/shared/components/FormWrapper/FormWrapper'
import { useAuth } from '@/shared/context/AuthContext'
import EmailIcon from '@/shared/icons/EmailIcon'
import { getErrorMessage } from '@/utils/getErrorMessage'

const DASHBOARD_ROUTES: Record<Role, string> = {
    [Role.DOCTOR]: '/dashboard/doctor',
    [Role.CAREGIVER]: '/dashboard/caregiver',
    [Role.PATIENT]: '/dashboard/patient',
}

const LoginForm = () => {
    const [role, setRole] = useState<Role>(Role.DOCTOR)
    const { setAuth } = useAuth()

    const { register, handleSubmit } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    })
    const navigate = useNavigate()

    const formSubmit = async (data: { email: string; password: string }) => {
        try {
            const result = await loginUser(data.email, data.password, role)
            setAuth(result.user)
            toast.success(result.message)
            navigate(DASHBOARD_ROUTES[result.user.role])
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    return (
        <FormWrapper title="Welcome Back" description="Secure access to your healthcare dashboard">
            <form className={styles.form} onSubmit={handleSubmit(formSubmit)}>
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
            <button onClick={() => navigate('/api/patients/register')} className={styles.patientRegister}>
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
