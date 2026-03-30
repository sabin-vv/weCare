import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import styles from './PatientRegisterForm.module.css'

import Button from '@/shared/components/Button/Button'
import FormWrapper from '@/shared/components/FormWrapper/FormWrapper'
import InputField from '@/shared/components/InputField/InputField'
import PasswordField from '@/shared/components/PasswordField/PasswordField'
import PhoneInput from '@/shared/components/PhoneInput/PhoneInput'
import SelectField from '@/shared/components/SelectField/SelectField'
import { Mail, User } from 'lucide-react'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { OtpPurpose } from '../../types/auth.types'
import { sendOtp } from '../../api/auth.api'
import { patientRegisterSchema } from '../../validator/register.schema'
import type { PatientRegisterData } from '../../validator/register.schema'

const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
]

const PatientRegisterForm = () => {
    const navigate = useNavigate()
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<PatientRegisterData>({
        resolver: zodResolver(patientRegisterSchema),
        defaultValues: {
            mobile: '',
        },
    })

    const today: Date = new Date()
    const maxDate = today.toISOString().split('T')[0]
    const min = new Date()
    min.setFullYear(today.getFullYear() - 100)
    const minDate = min.toISOString().split('T')[0]

    const handleSubmitForm = async (data: PatientRegisterData) => {
        try {
            const result = await sendOtp(data.email, OtpPurpose.REGISTER)

            toast.success(result.message)
            localStorage.setItem('patientRegisterData', JSON.stringify(data))
            navigate('/verify-email')
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }
    return (
        <FormWrapper title="Join as a Patient" description="Let's start by setting up your secure account credentials">
            <InputField
                label="Full Name"
                icon={<User />}
                placeholder="Enter your Full name"
                {...register('name')}
                errors={errors && errors.name?.message}
            />
            <InputField
                label="Email Address"
                icon={<Mail />}
                placeholder="name@email.com"
                {...register('email')}
                errors={errors && errors.email?.message}
            />
            <div className={styles.dobGenderWrapper}>
                <InputField
                    label="Date of Birth"
                    type="date"
                    {...register('dateOfBirth')}
                    max={maxDate}
                    min={minDate}
                    errors={errors && errors.dateOfBirth?.message}
                />
                <SelectField
                    label="Gender"
                    options={genderOptions}
                    {...register('gender')}
                    errors={errors.gender?.message}
                />
            </div>
            <Controller
                name="mobile"
                control={control}
                render={({ field }) => (
                    <PhoneInput
                        label="Phone Number"
                        value={field.value}
                        onChange={field.onChange}
                        error={errors && errors.mobile?.message}
                    />
                )}
            />
            <div className={styles.passwordWrap}>
                <PasswordField
                    label="Password"
                    placeholder="********"
                    {...register('password')}
                    error={errors && errors.password?.message}
                />
                <PasswordField
                    label="Confirm Password"
                    placeholder="********"
                    {...register('confirmPassword')}
                    error={errors && errors.confirmPassword?.message}
                />
            </div>
            <Button onClick={handleSubmit(handleSubmitForm)}>Complete Registration</Button>
        </FormWrapper>
    )
}

export default PatientRegisterForm
