import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { resetPaswordSchema } from '../../schemas/resetPasswordSchema'
import { resetPassword } from '../../services/auth.service'

import styles from './ForgotPasswordNewPasswordForm.module.css'

import Button from '@/shared/components/Button/Button'
import FormWrapper from '@/shared/components/FormWrapper/FormWrapper'
import PasswordField from '@/shared/components/PasswordField/PasswordField'
import { getErrorMessage } from '@/utils/getErrorMessage'

const ForgotPasswordNewPasswordForm = () => {
    const [loading, setLoading] = useState<boolean>(false)
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(resetPaswordSchema),
        defaultValues: {
            newPassword: '',
            confirmNewPassword: '',
        },
    })

    const email = searchParams.get('email')

    const [done, setDone] = useState(false)

    useEffect(() => {
        if (!email) {
            navigate('/api/auth/forgot-password')
        }
    }, [email, navigate])

    if (!email) return null

    const onSubmit = async (data: { newPassword: string; confirmNewPassword: string }) => {
        try {
            setLoading(true)
            const result = await resetPassword(email, data.newPassword)
            toast.success(result.message)
            setDone(true)
            setTimeout(() => {
                navigate('/api/auth/login')
            }, 1500)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }

    return (
        <FormWrapper title="Create new password" description="Choose a strong password and confirm it.">
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                {done && <div className={styles.success}>Password updated. Redirecting to login...</div>}

                <PasswordField
                    label="New Password"
                    placeholder="********"
                    id="newPassword"
                    {...register('newPassword')}
                    error={errors && errors.newPassword?.message}
                />

                <PasswordField
                    label="Confirm Password"
                    type="password"
                    placeholder="********"
                    id="confirmNewPassword"
                    {...register('confirmNewPassword')}
                    error={errors && errors.confirmNewPassword?.message}
                />

                <Button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Save password'}
                </Button>

                <div className={styles.actions}>
                    <button
                        className={styles.linkButton}
                        type="button"
                        onClick={() => navigate(`/api/auth/forgot-password/verify-otp?email=${email}`)}
                    >
                        Back to OTP
                    </button>
                    <button className={styles.linkButton} type="button" onClick={() => navigate('/api/auth/login')}>
                        Back to login
                    </button>
                </div>
            </form>
        </FormWrapper>
    )
}

export default ForgotPasswordNewPasswordForm
