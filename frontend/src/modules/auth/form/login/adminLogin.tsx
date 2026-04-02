import { zodResolver } from '@hookform/resolvers/zod'
import { User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { adminLogin } from '../../api/auth.api'

import styles from './AdminLogin.module.css'

import Button from '@/shared/components/Button/Button'
import FormWrapper from '@/shared/components/FormWrapper/FormWrapper'
import InputField from '@/shared/components/InputField/InputField'
import PasswordField from '@/shared/components/PasswordField/PasswordField'
import { useAuth } from '@/shared/context/AuthContext'
import { getErrorMessage } from '@/utils/getErrorMessage'

const adminLoginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

type AdminLoginValues = z.infer<typeof adminLoginSchema>

const AdminLogin = () => {
    const navigate = useNavigate()
    const { setAuth } = useAuth()
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<AdminLoginValues>({
        resolver: zodResolver(adminLoginSchema),
    })

    const onSubmit = async (data: AdminLoginValues) => {
        try {
            const res = await adminLogin(data.email, data.password)
            if (res.success) {
                setAuth(res.data)
                toast.success('Admin access granted')
                navigate('/admin/dashboard')
            }
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    return (
        <FormWrapper maxWidth="500px" title="Admin Portal" description="Wecare Healthcare Administrative Access">
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                <div className={styles.header}>
                    <h3 className={styles.title}>🔒 Secure Login</h3>
                    <p className={styles.subtitle}>ADMINISTRATIVE ACCESS ONLY</p>
                </div>

                <div className={styles.fields}>
                    <InputField
                        icon={<User />}
                        label="Administrator Email"
                        type="email"
                        placeholder="admin@wecare.com"
                        id="email"
                        {...register('email')}
                        errors={errors.email?.message}
                    />

                    <PasswordField
                        label="Security Password"
                        type="password"
                        placeholder="••••••••"
                        id="password"
                        {...register('password')}
                        error={errors.password?.message}
                        onForgotPassword={() => toast('Please contact the IT department for password recovery')}
                    />
                </div>

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Verifying...' : 'Secure Login'}
                </Button>
            </form>
        </FormWrapper>
    )
}

export default AdminLogin
