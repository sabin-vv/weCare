import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import FormWrapper from '@/shared/components/FormWrapper/FormWrapper'
import RoleSelector from '../../components/RoleSelector'
import { Mail } from 'lucide-react'
import PasswordField from '@/shared/components/PasswordField/PasswordField'
import InputField from '@/shared/components/InputField/InputField'
import Button from '@/shared/components/Button/Button'
import { loginSchema } from '../../validator/register.schema'
import { loginUser } from '../../api/auth.api'
import { useAuth } from '@/shared/context/AuthContext'
import { Role, type LoginFormData } from '../../types/auth.types'
import styles from './LoginForm.module.css'

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

            if (response.success) {
                setAuth({
                    id: response.user.email, // Using email as ID for now, adjust if backend provides proper ID
                    name: response.user.name,
                    email: response.user.email,
                })

                toast.success('Login successful!')

                // Navigate based on role
                switch (data.role) {
                    case Role.DOCTOR:
                        navigate('/doctor/dashboard')
                        break
                    case Role.CAREGIVER:
                        navigate('/caregiver/dashboard')
                        break
                    case Role.ADMIN:
                        navigate('/admin/dashboard')
                        break
                    case Role.PATIENT:
                        navigate('/patient/dashboard')
                        break
                    default:
                        navigate('/')
                }
            } else {
                toast.error(response.message || 'Login failed')
            }
        } catch (error) {
            console.error('Login error:', error)
            toast.error('An error occurred during login')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <FormWrapper title="Welcome Back" description="Secure access to your healthcare dashboard">
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
            <button onClick={() => navigate('/patients/register')} className={styles.patientRegister}>
                Register as Patient
            </button>

            <div className={styles.professionalCard}>
                <h3>Medical Professionals</h3>
                <p>Medical professionals require verification before activation.</p>
                <div className={styles.professioanlRegister}>
                    <button onClick={() => navigate('/doctors/register')}>Apply as a Doctor</button>
                    <button onClick={() => navigate('/caregivers/register')}>Register as Caregiver</button>
                </div>
            </div>
        </FormWrapper>
    )
}

export default LoginForm
