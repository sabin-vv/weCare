import { zodResolver } from '@hookform/resolvers/zod'
import { Home, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { getCurrentUser, loginUser } from '../../api/auth.api'
import { Role } from '../../types/auth.types'

import styles from './AdminLogin.module.css'

import { env } from '@/config/env'
import Button from '@/shared/components/Button/Button'
import FormWrapper from '@/shared/components/FormWrapper/FormWrapper'
import InputField from '@/shared/components/InputField/InputField'
import PasswordField from '@/shared/components/PasswordField/PasswordField'
import { useAuth } from '@/shared/context/AuthContext'
import { usePlatform } from '@/shared/context/PlatformContext'
import { getErrorMessage } from '@/utils/getErrorMessage'

const adminLoginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
})

type AdminLoginValues = z.infer<typeof adminLoginSchema>

const AdminLogin = () => {
    const navigate = useNavigate()
    const { setAuth } = useAuth()
    const { settings } = usePlatform()

    const baseUrl = env.AWS_BASE_URL
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<AdminLoginValues>({
        resolver: zodResolver(adminLoginSchema),
    })

    const onSubmit = async (data: AdminLoginValues) => {
        try {
            const res = await loginUser(data.email, data.password, Role.ADMIN)
            if (res.success) {
                setAuth(res.data)

                try {
                    const profile = await getCurrentUser()
                    setAuth({
                        ...res.data,
                        ...profile.data,
                    })
                } catch {
                    toast.error('Failed to load profile')
                }

                toast.success('Admin access granted')
                navigate('/admin/dashboard')
            }
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    return (
        <FormWrapper maxWidth="500px" title="">
            <div className={styles.logoSection}>
                <img src={`${baseUrl}${settings?.platformIcon}`} alt="logo" className={styles.logo} />
                <h2>WeCare</h2>
                <p>Healthcare Management Platform</p>
            </div>

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
                    />
                </div>

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Verifying...' : 'Secure Login'}
                </Button>

                <Link to="/" className={styles.homeLink}>
                    <Home size={16} />
                    Return to Home
                </Link>

                <p className={styles.footerText}>Authorized personnel only • WeCare Healthcare</p>
            </form>
        </FormWrapper>
    )
}

export default AdminLogin
