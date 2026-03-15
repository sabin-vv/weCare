import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import FormWrapper from '../../../../shared/components/FormWrapper/FormWrapper'
import ProgressBar from '../../components/ProgressBar'
import { doctorStepOneSchema } from '../../schemas/doctorStepOneSchema'
import { sendOtp } from '../../services/auth.service'
import type { RegisterFormData, StepOneProps } from '../../types/auth.types'

import styles from './DoctorStepOne.module.css'

import Button from '@/shared/components/Button/Button'
import InputField from '@/shared/components/InputField/InputField'
import PasswordField from '@/shared/components/PasswordField/PasswordField'
import PhoneInput from '@/shared/components/PhoneInput/PhoneInput'
import EmailIcon from '@/shared/icons/EmailIcon'
import UserIcon from '@/shared/icons/UserIcon'
import { getErrorMessage } from '@/utils/getErrorMessage'

const DoctorStepOne = ({ formData, setFormData, nextStep }: StepOneProps) => {
    const [loading, setLoading] = useState<boolean>(false)

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(doctorStepOneSchema),
        defaultValues: formData,
    })

    async function handleNext(data: RegisterFormData) {
        setLoading(true)
        try {
            const res = await sendOtp(data.email)

            if (!res.success) {
                toast.error(res.message)
                setLoading(false)
                return
            }
            toast.success(res.message)
        } catch (error: unknown) {
            toast.error(getErrorMessage(error))
            setLoading(false)
            return
        }

        setFormData((prev) => {
            const updated = { ...prev, basicInfo: data }
            localStorage.setItem('doctorRegister', JSON.stringify(updated))
            return updated
        })
        setLoading(false)
        nextStep()
    }
    return (
        <FormWrapper title="Doctor Registration" description="Step 1: Create your professional account to get started">
            <ProgressBar step={1} totalSteps={4} title="Basic Information" percentage={25} />
            <InputField
                icon={<UserIcon />}
                prefix="Dr."
                label="Full Name"
                type="text"
                id="name"
                {...register('name')}
                errors={errors?.name?.message}
            />

            <InputField
                icon={<EmailIcon />}
                label="Primary Email"
                type="text"
                placeholder="johndoe@example.com"
                id="email"
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
                        onChange={field.onChange}
                        error={errors.mobile?.message}
                    />
                )}
            />

            <div className={styles.passwordWrapper}>
                <div>
                    <PasswordField
                        label="Password"
                        placeholder="********"
                        id="password"
                        {...register('password')}
                        error={errors.password?.message}
                    />
                </div>
                <div>
                    <PasswordField
                        label="Confirm Password"
                        type="password"
                        placeholder="********"
                        id="confirmPassword"
                        {...register('confirmPassword')}
                        error={errors.confirmPassword?.message}
                    />
                </div>
            </div>
            <Button disabled={loading} type="button" onClick={handleSubmit(handleNext)}>
                {loading ? 'Sending OTP ...' : 'Send OTP'}
            </Button>
        </FormWrapper>
    )
}

export default DoctorStepOne
