import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import ProgressBar from '../../components/ProgressBar'
import { doctorStepOneSchema } from '../../schemas/doctorStepOneSchema'
import { sendOtp } from '../../services/auth.service'
import { OtpPurpose, type caregiverStepOneProps, type RegisterFormData } from '../../types/auth.types'

import styles from './CaregiverStepOne.module.css'

import Button from '@/shared/components/Button/Button'
import FormWrapper from '@/shared/components/FormWrapper/FormWrapper'
import InputField from '@/shared/components/InputField/InputField'
import PasswordField from '@/shared/components/PasswordField/PasswordField'
import PhoneInput from '@/shared/components/PhoneInput/PhoneInput'
import EmailIcon from '@/shared/icons/EmailIcon'
import UserIcon from '@/shared/icons/UserIcon'
import { getErrorMessage } from '@/utils/getErrorMessage'

const CaregiverStepOne = ({ nextStep, formData, setFormData }: caregiverStepOneProps) => {
    const [loading, setLoading] = useState<boolean>(false)

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(doctorStepOneSchema),
        defaultValues: formData,
    })
    useEffect(() => {
        const savedData = localStorage.getItem('caregiverRegister')

        if (savedData) {
            const parsedData = JSON.parse(savedData)
            setFormData(parsedData)
            reset(parsedData.basicInfo)
        }
    }, [reset])

    const handleNext = async (data: RegisterFormData) => {
        setLoading(true)
        try {
            const result = await sendOtp(data.email, OtpPurpose.EMAIL_VERIFICATION)

            setFormData((prev) => {
                const updated = { ...prev, basicInfo: data }
                localStorage.setItem('caregiverRegister', JSON.stringify(updated))
                return updated
            })
            toast.success(result.message)
            nextStep()
        } catch (error: unknown) {
            toast.error(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }

    return (
        <FormWrapper
            title="Caregiver Registration"
            description="This registration is intended for licensed or trained home nurses."
        >
            <ProgressBar step={1} totalSteps={4} title="Basic information" percentage={25} />

            <InputField
                icon={<UserIcon />}
                label="Full name"
                type="text"
                id="name"
                placeholder="John Doe"
                {...register('name')}
                errors={errors?.name?.message}
            />
            <InputField
                icon={<EmailIcon />}
                label="Email"
                type="text"
                placeholder="john@email.com"
                id="email"
                {...register('email')}
                errors={errors?.email?.message}
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
                <PasswordField
                    label="Password"
                    placeholder="********"
                    {...register('password')}
                    error={errors.password?.message}
                />
                <PasswordField
                    label="Confirm Password"
                    placeholder="********"
                    {...register('confirmPassword')}
                    error={errors.confirmPassword?.message}
                />
            </div>
            <Button disabled={loading} onClick={handleSubmit(handleNext)}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
        </FormWrapper>
    )
}

export default CaregiverStepOne
