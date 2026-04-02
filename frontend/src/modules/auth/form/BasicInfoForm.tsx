import { zodResolver } from '@hookform/resolvers/zod'
import { User } from 'lucide-react'
import { Mail } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'

import ProgressBar from '../components/ProgressBar'
import type { BasicInfoFormProps, RegisterFormData } from '../types/auth.types'
import { basicInfoSchema } from '../validator/register.schema'

import styles from './BasicInfoForm.module.css'

import Button from '@/shared/components/Button/Button'
import FormWrapper from '@/shared/components/FormWrapper/FormWrapper'
import InputField from '@/shared/components/InputField/InputField'
import PasswordField from '@/shared/components/PasswordField/PasswordField'
import PhoneInput from '@/shared/components/PhoneInput/PhoneInput'

const BasicInfoForm = ({ defaultValues, title, description, onSubmit, loading, role }: BasicInfoFormProps) => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(basicInfoSchema),
        defaultValues,
    })

    return (
        <FormWrapper title={title} maxWidth="520px" description={description}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <ProgressBar step={1} totalSteps={4} percentage={25} title="Basic Information" />
                <InputField
                    placeholder="John Doe"
                    icon={<User />}
                    prefix={role === 'doctor' ? 'Dr.' : ''}
                    label="Full Name"
                    {...register('name')}
                    errors={errors.name?.message}
                />

                <InputField
                    placeholder="user@email.com"
                    icon={<Mail />}
                    label="Email"
                    type="email"
                    {...register('email')}
                    errors={errors.email?.message}
                />

                <Controller
                    name="mobile"
                    control={control}
                    render={({ field }) => (
                        <PhoneInput
                            label="Phone Number"
                            value={field.value}
                            onChange={(val) => field.onChange(val)}
                            error={errors.mobile?.message}
                        />
                    )}
                />

                <div className={styles.passwordWrapper}>
                    <PasswordField
                        placeholder="********"
                        label="Password"
                        {...register('password')}
                        error={errors.password?.message}
                    />

                    <PasswordField
                        placeholder="********"
                        label="Confirm Password"
                        {...register('confirmPassword')}
                        error={errors.confirmPassword?.message}
                    />
                </div>

                <Button type="submit" disabled={loading}>
                    {loading ? 'Please wait...' : 'Next'}
                </Button>
            </form>
        </FormWrapper>
    )
}

export default BasicInfoForm
