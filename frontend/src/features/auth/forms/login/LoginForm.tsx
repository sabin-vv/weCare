import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Button from '../../../../shared/components/Button/Button'
import InputField from '../../../../shared/components/InputField/InputField'
import PasswordField from '../../../../shared/components/PasswordField/PasswordField'
import RoleSelector from '../../components/RoleSelector'
import type { Role } from '../../types/auth.types'

import styles from './LoginForm.module.css'

import FormWrapper from '@/shared/components/FormWrapper/FormWrapper'
import EmailIcon from '@/shared/icons/EmailIcon'

interface InputProps {
    email: string
    password: string
}

const LoginForm = () => {
    const [role, setRole] = useState<Role>('doctor')
    const [formData, setFormData] = useState<InputProps>({
        email: '',
        password: '',
    })
    const navigate = useNavigate()
    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    return (
        <FormWrapper title="Welcome Back" description="Secure access to your healthcare dashboard">
            <form className={styles.form}>
                <RoleSelector role={role} onChange={setRole} />
                <InputField
                    icon={<EmailIcon />}
                    label="Email Address"
                    name="email"
                    type="text"
                    placeholder="eg. example@email.com"
                    value={formData.email}
                    id="email"
                    onChange={handleInput}
                />
                <PasswordField
                    onForgotPassword={() => navigate('/api/auth/forgot-password')}
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="********"
                    value={formData.password}
                    id="password"
                    onChange={handleInput}
                />

                <Button type="submit">Sign In</Button>
            </form>
            <button className={styles.patientRegister}>Register as Patient</button>

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
