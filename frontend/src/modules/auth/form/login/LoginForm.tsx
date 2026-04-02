import { zodResolver } from '@hookform/resolvers/zod'
import { Mail } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import { loginUser } from '../../api/auth.api'
import RoleSelector from '../../components/RoleSelector'
import { Role, type LoginFormData } from '../../types/auth.types'
import { loginSchema } from '../../validator/register.schema'

import styles from './LoginForm.module.css'

import Button from '@/shared/components/Button/Button'
import FormWrapper from '@/shared/components/FormWrapper/FormWrapper'
import InputField from '@/shared/components/InputField/InputField'
import PasswordField from '@/shared/components/PasswordField/PasswordField'
import { useAuth } from '@/shared/context/AuthContext'
import { getErrorMessage } from '@/utils/getErrorMessage'

const LoginForm = () => {
    const [role, setRole] = useState<Role>(Role.DOCTOR)
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()
    const { setAuth } = useAuth()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            role: Role.DOCTOR,
        },
    })

    const formSubmit = async (data: LoginFormData) => {
        setIsLoading(true)
        try {
            const response = await loginUser(data.email, data.password, data.role)

            setAuth({
                id: response.data.email,
                name: response.data.name,
                email: response.data.email,
            })

            toast.success(response.message)

            switch (data.role) {
                case Role.DOCTOR:
                    navigate('/doctor/dashboard')
                    break
                case Role.CAREGIVER:
                    navigate('/caregiver/dashboard')
                    break
                case Role.PATIENT:
                    navigate('/patient/dashboard')
                    break
                default:
                    navigate('/')
            }
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <FormWrapper maxWidth="700px" title="Welcome Back" description="Secure access to your healthcare dashboard">
            <form className={styles.form} onSubmit={handleSubmit(formSubmit)}>
                <RoleSelector role={role} onChange={setRole} />
                <InputField
                    icon={<Mail />}
                    label="Email Address"
                    type="email"
                    placeholder="eg. example@email.com"
                    id="email"
                    errors={errors.email?.message}
                    {...register('email')}
                />
                <PasswordField
                    onForgotPassword={() => navigate('/auth/forgot-password')}
                    label="Password"
                    type="password"
                    placeholder="********"
                    id="password"
                    error={errors.password?.message}
                    {...register('password')}
                />

                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
            </form>
            <button onClick={() => navigate('/auth/patients/register')} className={styles.patientRegister}>
                Register as Patient
            </button>

            <div className={styles.professionalCard}>
                <h3>Medical Professionals</h3>
                <p>Medical professionals require verification before activation.</p>
                <div className={styles.professionalRegister}>
                    <button onClick={() => navigate('/auth/doctors/register')}>Apply as a Doctor</button>
                    <button onClick={() => navigate('/auth/caregivers/register')}>Register as Caregiver</button>
                </div>
            </div>
        </FormWrapper>
    )
}

export default LoginForm
